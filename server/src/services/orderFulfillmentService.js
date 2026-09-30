import Product from "../models/Product.js";

/**
 * Order Fulfillment Service
 *
 * Vegetables/fruits stock and prices can change hour to hour, so a
 * Today/Tomorrow order is never a guarantee of the exact stock or price at
 * checkout time — only a placeholder. This service re-verifies each item
 * against the live catalog (on the delivery day, or whenever an admin
 * triggers it before preparing the order), and applies whatever the
 * customer decides to do about anything that changed.
 *
 * Stock itself is only ever reserved when an order is *confirmed* (see
 * orderController#updateOrderStatus) — never at checkout — so a
 * Today/Tomorrow order never permanently locks up future inventory on its
 * own. `fulfilledQuantity` / `resolution.replacement` on each item is the
 * single source of truth for "what should actually be deducted/charged for
 * this line", which the confirm/cancel stock bookkeeping in
 * orderController reads via `getFulfillmentTarget` below.
 */

const STATUSES_WITH_STOCK_DEDUCTED = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function normalizeLabel(label) {
  return (label || "").trim().toLowerCase();
}

function findVariant(product, label) {
  if (!product?.variants?.length) return null;
  return (
    product.variants.find((v) => normalizeLabel(v.label) === normalizeLabel(label)) ||
    null
  );
}

/**
 * The product + quantity that should actually be deducted from / restored
 * to stock, and counted in sales, for one order line — accounting for any
 * customer resolution (a "replace" moves the target product; "remove" /
 * a partial acceptance change the quantity).
 */
function getFulfillmentTarget(item) {
  return {
    productId: item.resolution?.replacement?.product || item.product,
    qty: item.fulfilledQuantity ?? item.quantity,
  };
}

/** The per-unit price actually being charged for a line item right now. */
function effectiveUnitPrice(item) {
  if (item.resolution?.action === "replace" && item.resolution.replacement) {
    return item.resolution.replacement.price;
  }
  if (
    item.resolution?.action === "accept_price" &&
    item.availabilityIssue?.newPrice != null
  ) {
    return item.availabilityIssue.newPrice;
  }
  return item.price;
}

/**
 * Re-derives pricing.subtotal/shippingFee/total from each item's current
 * fulfilledQuantity + effective price. Mutates `order.pricing` in place;
 * caller is responsible for saving. Mirrors the ₹199 free-delivery
 * threshold used at checkout (orderController#createOrder).
 */
function recalculatePricing(order) {
  const subtotal = order.items.reduce((sum, item) => {
    const qty = item.fulfilledQuantity ?? item.quantity;
    return sum + qty * effectiveUnitPrice(item);
  }, 0);

  const shippingFee = subtotal <= 0 || subtotal > 199 ? 0 : 25;
  const discount = order.pricing.discount || 0;
  const total = Math.max(0, subtotal - discount + shippingFee);

  order.pricing.subtotal = subtotal;
  order.pricing.shippingFee = shippingFee;
  order.pricing.total = total;

  return order.pricing;
}

/**
 * Re-checks every not-yet-resolved item against the live catalog: gone/
 * inactive product or discontinued variant and insufficient trackable
 * stock both count as "unavailable" (or "partial_stock" if some stock
 * remains); a live price that no longer matches what was charged counts
 * as "price_change". Clears any previous issue that no longer applies
 * (e.g. the item was restocked before the customer acted on it).
 *
 * Already-resolved items are left untouched — the customer's decision
 * stands regardless of what the catalog does next.
 *
 * @returns {{order: Order, issues: Array}} the saved order and the list of
 *   items currently carrying an unresolved issue.
 */
async function verifyOrderAvailability(order) {
  for (const item of order.items) {
    if (item.resolution?.action) continue;

    const qtyNeeded = item.fulfilledQuantity ?? item.quantity;
    const product = await Product.findById(item.product);

    if (!product || !product.isActive) {
      item.availabilityIssue = {
        issueType: "unavailable",
        detectedAt: new Date(),
        availableQty: 0,
      };
      continue;
    }

    const variant = findVariant(product, item.variant);
    if (!variant) {
      // The exact variant ordered no longer exists on the product.
      item.availabilityIssue = {
        issueType: "unavailable",
        detectedAt: new Date(),
        availableQty: 0,
      };
      continue;
    }

    if (product.trackInventory && product.stock < qtyNeeded) {
      item.availabilityIssue = {
        issueType: product.stock > 0 ? "partial_stock" : "unavailable",
        detectedAt: new Date(),
        availableQty: Math.max(product.stock, 0),
      };
      continue;
    }

    if (variant.price !== item.price) {
      item.availabilityIssue = {
        issueType: "price_change",
        detectedAt: new Date(),
        newPrice: variant.price,
      };
      continue;
    }

    item.availabilityIssue = undefined;
  }

  order.fulfillment = order.fulfillment || {};
  order.fulfillment.lastVerifiedAt = new Date();
  order.fulfillment.needsCustomerAction = order.items.some(
    (item) => item.availabilityIssue?.issueType && !item.resolution?.action,
  );

  await order.save();

  const issues = order.items
    .filter((item) => item.availabilityIssue?.issueType && !item.resolution?.action)
    .map((item) => ({
      itemId: item._id,
      name: item.name,
      variant: item.variant,
      quantity: item.quantity,
      price: item.price,
      issueType: item.availabilityIssue.issueType,
      detectedAt: item.availabilityIssue.detectedAt,
      availableQty: item.availabilityIssue.availableQty,
      newPrice: item.availabilityIssue.newPrice,
    }));

  return { order, issues };
}

/**
 * Applies the customer's (or admin's) chosen resolution to one flagged
 * item, reconciles stock immediately if this order already had stock
 * deducted for it (i.e. it was already confirmed/processing/shipped —
 * see STATUSES_WITH_STOCK_DEDUCTED), and recalculates pricing.
 *
 * Throws a plain Error with a customer-facing message on any validation
 * failure — callers should turn that into a 400 response.
 */
async function applyItemResolution(order, itemId, options = {}) {
  const { action, resolvedBy = "customer", replacementProductId, replacementVariant } =
    options;

  const item = order.items.id(itemId);
  if (!item) {
    throw new Error("Order item not found");
  }
  if (!item.availabilityIssue?.issueType) {
    throw new Error("This item has no availability issue to resolve");
  }
  if (item.resolution?.action) {
    throw new Error("This item has already been resolved");
  }

  const stockAlreadyDeducted = STATUSES_WITH_STOCK_DEDUCTED.includes(order.status);
  const before = getFulfillmentTarget(item);

  const resolution = { action, resolvedAt: new Date(), resolvedBy };

  if (action === "remove") {
    item.fulfilledQuantity = 0;
  } else if (action === "accept_partial") {
    if (item.availabilityIssue.issueType !== "partial_stock") {
      throw new Error(
        "A partial quantity can only be accepted for a partial-stock issue",
      );
    }
    const availableQty = item.availabilityIssue.availableQty || 0;
    if (availableQty <= 0) {
      throw new Error("No stock is currently available for this item");
    }
    item.fulfilledQuantity = availableQty;
  } else if (action === "accept_price") {
    if (item.availabilityIssue.issueType !== "price_change") {
      throw new Error("There is no price change to accept for this item");
    }
    // Quantity/product unchanged — effectiveUnitPrice() picks up the new price.
  } else if (action === "replace") {
    if (!replacementProductId || !replacementVariant) {
      throw new Error("A replacement product and variant are required");
    }
    const product = await Product.findById(replacementProductId);
    if (!product || !product.isActive) {
      throw new Error("The selected replacement product is not available");
    }
    const variant = findVariant(product, replacementVariant);
    if (!variant) {
      throw new Error("The selected replacement variant is not available");
    }
    const qtyNeeded = item.fulfilledQuantity ?? item.quantity;
    if (product.trackInventory && product.stock < qtyNeeded) {
      throw new Error(
        `Only ${product.stock} of "${product.name}" are currently in stock`,
      );
    }
    resolution.replacement = {
      product: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0]?.url || "",
      variant: variant.label,
      price: variant.price,
    };
  } else {
    throw new Error(`Unsupported resolution action: ${action}`);
  }

  item.resolution = resolution;
  const after = getFulfillmentTarget(item);

  // This order's stock was already committed against the *previous*
  // target (original product, full quantity, or an earlier resolution) —
  // give that back and take the new target's stock instead, right now.
  if (stockAlreadyDeducted) {
    if (before.qty > 0) {
      await Product.updateOne(
        { _id: before.productId },
        { $inc: { stock: before.qty } },
      );
    }
    if (after.qty > 0) {
      const targetProduct = await Product.findById(after.productId);
      if (!targetProduct) {
        throw new Error("Replacement product could not be found");
      }
      if (targetProduct.trackInventory && targetProduct.stock < after.qty) {
        throw new Error(
          `${targetProduct.name}: insufficient stock to fulfill (${targetProduct.stock} available)`,
        );
      }
      if (targetProduct.trackInventory) {
        await Product.updateOne(
          { _id: after.productId },
          { $inc: { stock: -after.qty } },
        );
      }
    }
  }

  recalculatePricing(order);
  order.fulfillment = order.fulfillment || {};
  order.fulfillment.needsCustomerAction = order.items.some(
    (i) => i.availabilityIssue?.issueType && !i.resolution?.action,
  );

  await order.save();
  return order;
}

export default {
  STATUSES_WITH_STOCK_DEDUCTED,
  getFulfillmentTarget,
  effectiveUnitPrice,
  recalculatePricing,
  verifyOrderAvailability,
  applyItemResolution,
};
