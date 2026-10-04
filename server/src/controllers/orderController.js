import {
  sendAdminOrderNotificationEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderUpdatedEmail,
} from "../config/email.js";
import { createRefund, fetchRefund } from "../config/razorpay.js";
import {
  isPincodeServiceable,
  NON_SERVICEABLE_MESSAGE,
} from "../config/serviceableAreas.js";
import shipRocketService from "../config/ship-rocket-config.js";
// import shipRocketService from '../config/shipRocket.js';
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import Notification from "../models/Notification.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import orderFulfillmentService from "../services/orderFulfillmentService.js";
import orderNotificationService from "../services/orderNotificationService.js";
import {
  grantLoyaltyOnDelivery,
  notifyCustomerOfStatus,
} from "../services/orderStatusService.js";
import {
  getAvailability,
  getTodayId,
  isTodayOrTomorrow,
  releaseSlot,
  reserveSlot,
  toDateId,
} from "../utils/deliveryCapacity.js";
import { cancelShiprocketShipment } from "./shipmentController.js";

/**
 * Order Controller
 * Handles order creation and management
 */
class OrderController {
  /**
   * Get all orders for current user
   * @route GET /api/orders
   * @access Private
   */
  async getOrders(req, res) {
    try {
      const { page = 1, limit = 10, status, sort = "-createdAt" } = req.query;

      const query = {
        user: req.user._id,
        // Hide only abandoned online-payment orders (pending + not paid + not COD)
        // COD orders and any confirmed/processing/shipped/delivered/cancelled orders are always shown
        $or: [
          { "payment.method": "cod" }, // COD orders always visible
          { "payment.status": "completed" }, // Paid online orders
          { status: { $ne: "pending" } }, // Any non-pending order
        ],
      };

      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;
      const [orders, total] = await Promise.all([
        Order.find(query).sort(sort).skip(skip).limit(Number(limit)),
        Order.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
    }
  }

  /**
   * Get single order by ID
   * @route GET /api/orders/:id
   * @access Private
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findById(id).populate(
        "user",
        "firstName lastName email phone",
      );
      // console.log("Fetched Order:", order);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if user owns this order or is admin/vendor
      // Handle both populated user object and ObjectId
      const orderUserId =
        typeof order.user === "object" && order.user._id
          ? order.user._id.toString()
          : order.user.toString();
      const currentUserId = req.user._id.toString();
      const userRole = req.user.role;

      // Allow access if:
      // 1. User owns the order (customer)
      // 2. User is an admin
      // 3. User is a vendor (for their sold products)
      const isOwner = orderUserId === currentUserId;
      const isAdmin = userRole === "admin";
      const isVendor = userRole === "vendor";

      if (!isOwner && !isAdmin && !isVendor) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this order",
        });
      }
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
        error: error.message,
      });
    }
  }

  async checkStockAvailability(req, res) {
    try {
      const { items, deliveryDate } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Items are required",
        });
      }

      const deliveryDateId = deliveryDate ? toDateId(deliveryDate) : null;
      if (!deliveryDateId || !isTodayOrTomorrow(deliveryDateId)) {
        return res.status(400).json({
          success: false,
          message: "Delivery date must be today or tomorrow",
        });
      }

      const isTodayDelivery = deliveryDateId === getTodayId();

      const results = [];
      for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product || !product.isActive) {
          results.push({
            product: item.product,
            name: product?.name || item.name,
            requestedQty: item.quantity,
            availableQty: 0,
            isPartial: true,
          });
          continue;
        }

        if (!isTodayDelivery || !product.trackInventory) {
          results.push({
            product: item.product,
            name: product.name,
            requestedQty: item.quantity,
            availableQty: item.quantity,
            isPartial: false,
          });
          continue;
        }

        const availableQty = Math.min(
          item.quantity,
          Math.max(product.stock, 0),
        );

        results.push({
          product: item.product,
          name: product.name,
          requestedQty: item.quantity,
          availableQty,
          isPartial: availableQty < item.quantity,
        });
      }

      res.json({
        success: true,
        data: {
          items: results,
          hasPartial: results.some((r) => r.isPartial),
        },
      });
    } catch (error) {
      console.error("Check stock availability error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check stock availability",
        error: error.message,
      });
    }
  }

  /**
   * Re-verifies a scheduled order's items against the live catalog —
   * stock and price can both move between checkout and delivery day for a
   * vegetables/fruits business, so this is the "check actual stock before
   * preparing" / "recheck on delivery day" gate. Run automatically by the
   * daily fulfillment job (see jobs/orderVerificationJob.js) and available
   * here for an admin to trigger manually before confirming/preparing an
   * order. Notifies the customer if anything needs their attention.
   * @route POST /api/orders/:id/verify-availability
   * @access Private (Admin only)
   */
  async verifyAvailability(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id).populate("user");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (["delivered", "cancelled", "refunded"].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot verify availability for an order that is already ${order.status}`,
        });
      }

      const { issues } =
        await orderFulfillmentService.verifyOrderAvailability(order);

      if (issues.length > 0) {
        await orderNotificationService.notifyCustomerOfAvailabilityIssues(
          order,
          order.user,
          issues,
        );
      }

      res.json({
        success: true,
        message: issues.length
          ? `${issues.length} item(s) need customer attention`
          : "All items verified — stock and prices are unchanged",
        data: { order, issues },
      });
    } catch (error) {
      console.error("Verify order availability error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify order availability",
        error: error.message,
      });
    }
  }

  /**
   * Applies the customer's chosen resolution (replace / remove / accept
   * the new price / accept a partial quantity) to one flagged order item,
   * recalculates the order total, and — only when the total actually
   * changed — tells the customer before delivery.
   * @route PUT /api/orders/:id/items/:itemId/resolve
   * @access Private (order owner or admin)
   */
  async resolveOrderItem(req, res) {
    try {
      const { id, itemId } = req.params;
      const { action, replacementProductId, replacementVariant } = req.body;

      const order = await Order.findById(id).populate("user");
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const orderUserId =
        typeof order.user === "object" && order.user._id
          ? order.user._id.toString()
          : order.user.toString();
      const isOwner = orderUserId === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this order",
        });
      }

      if (["delivered", "cancelled", "refunded"].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot update items on an order that is already ${order.status}`,
        });
      }

      const totalBefore = order.pricing.total;

      try {
        await orderFulfillmentService.applyItemResolution(order, itemId, {
          action,
          resolvedBy: isAdmin && !isOwner ? "admin" : "customer",
          replacementProductId,
          replacementVariant,
        });
      } catch (resolutionError) {
        return res.status(400).json({
          success: false,
          message: resolutionError.message,
        });
      }

      // Only announce a change once it actually moves the amount due —
      // repeated resolutions on the same order (e.g. two flagged items)
      // shouldn't spam the customer per item.
      if (Math.abs(order.pricing.total - totalBefore) >= 1) {
        order.fulfillment.customerNotifiedOfChangeAt = new Date();
        await order.save();
        await orderNotificationService.notifyCustomerOfOrderUpdate(
          order,
          order.user,
        );
      }

      res.json({
        success: true,
        message: "Item updated successfully",
        data: order,
      });
    } catch (error) {
      console.error("Resolve order item error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order item",
        error: error.message,
      });
    }
  }

  /**
   * Create new order
   * @route POST /api/orders
   * @access Private
   */
  async createOrder(req, res) {
    try {
      const {
        items,
        shippingAddress,
        // paymentMethod,
        pricing: frontendPricing,
        coupon,
        notes,
        deliveryDate,
        deliveryTimeSlot,
      } = req.body;
      const paymentMethod = "cod";
      // Validate items
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Order must contain at least one item",
        });
      }

      // Final server-side pincode serviceability check — the authoritative
      // gate for order placement, regardless of any frontend check already
      // performed. Serviceable pincodes are configurable via
      // SERVICEABLE_PINCODES (see config/serviceableAreas.js).
      if (!isPincodeServiceable(shippingAddress?.zipCode)) {
        return res.status(400).json({
          success: false,
          message: NON_SERVICEABLE_MESSAGE,
          code: "PINCODE_NOT_SERVICEABLE",
        });
      }

      // Validate delivery date is today/tomorrow and still has capacity
      const deliveryDateId = deliveryDate ? toDateId(deliveryDate) : null;
      if (!deliveryDateId || !isTodayOrTomorrow(deliveryDateId)) {
        return res.status(400).json({
          success: false,
          message: "Delivery date must be today or tomorrow",
          code: "DELIVERY_DATE_UNAVAILABLE",
        });
      }

      const deliveryAvailability = await getAvailability([deliveryDateId]);
      if (!deliveryAvailability[deliveryDateId]) {
        return res.status(400).json({
          success: false,
          message:
            "Selected delivery date is no longer available. Please choose another date.",
          code: "DELIVERY_DATE_UNAVAILABLE",
        });
      }

      const isTodayDelivery = deliveryDateId === getTodayId();

      const processedItems = [];
      let calculatedSubtotal = 0;

      for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product || !product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.name || item.product} is not available`,
          });
        }

        const variant = product.variants.find(
          (v) =>
            v.label?.trim().toLowerCase() ===
            item.variant?.trim().toLowerCase(),
        );
        if (!variant) {
          return res.status(400).json({
            success: false,
            message: `${product.name}: Invalid variant selected`,
          });
        }

        if (
          isTodayDelivery &&
          product.trackInventory &&
          product.stock < item.quantity
        ) {
          return res.status(400).json({
            success: false,
            message: `${product.name}: Only ${product.stock} items available`,
          });
        }

        const itemPrice = variant.price;
        const itemSubtotal = itemPrice * item.quantity;

        calculatedSubtotal += itemSubtotal;

        console.log("varients", variant, variant.label);
        processedItems.push({
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images?.[0]?.url || "",
          quantity: item.quantity,
          fulfilledQuantity: item.quantity,
          variant: variant.label, // ✅ changed
          price: itemPrice, // ✅ changed
          subtotal: itemSubtotal,
        });

        // Note: Stock will be deducted when order is confirmed
      }

      // --- DELIVERY FEE LOGIC: ₹25 for orders ≤ ₹199; free above ₹199 (must match frontend) ---
      let discount = 0;
      let deliveryFee = calculatedSubtotal > 199 ? 0 : 25;
      let couponData = null;
      // Set once a valid coupon is found below, so it can be marked used
      // after the order is actually created.
      let couponDoc = null;

      // Redeem a loyalty coupon (see Coupon model / loyaltyService) if one
      // was supplied. Each coupon belongs to exactly one user and can only
      // ever be redeemed once.
      if (coupon && coupon.code) {
        couponDoc = await Coupon.findOne({
          code: coupon.code.trim().toUpperCase(),
          user: req.user._id,
        });

        if (!couponDoc) {
          return res.status(400).json({
            success: false,
            message: "Invalid coupon code",
          });
        }
        if (couponDoc.isUsed) {
          return res.status(400).json({
            success: false,
            message: "This coupon has already been used",
          });
        }
        if (couponDoc.expiresAt && couponDoc.expiresAt < new Date()) {
          return res.status(400).json({
            success: false,
            message: "This coupon has expired",
          });
        }

        discount =
          couponDoc.discountType === "percentage"
            ? Math.round(
                (calculatedSubtotal * couponDoc.discountValue) / 100,
              )
            : couponDoc.discountValue;
        if (couponDoc.freeDelivery) {
          deliveryFee = 0;
        }
        couponData = {
          code: couponDoc.code,
          discount,
          freeDelivery: couponDoc.freeDelivery,
        };
      }

      // Calculate final total (never negative)
      const calculatedTotal = Math.max(
        0,
        calculatedSubtotal - discount + deliveryFee,
      );

      // Validate frontend pricing matches backend calculation (with tolerance for rounding)
      if (frontendPricing) {
        // Allow 1 rupee tolerance for rounding differences
        const totalDiff = Math.abs(frontendPricing.total - calculatedTotal);

        // Reject order if total difference is more than ₹5 (security check for price manipulation)
        if (totalDiff > 5) {
          return res.status(400).json({
            success: false,
            message:
              "Pricing validation failed. Product prices may have changed. Please refresh your cart and try again.",
            errors: [
              {
                field: "pricing",
                message: `Total amount mismatch: Expected ₹${calculatedTotal}, received ₹${frontendPricing.total}`,
              },
            ],
          });
        }
      }

      // Create order with validated pricing (always use backend-calculated values)
      const order = await Order.create({
        user: req.user._id,
        items: processedItems,
        shippingAddress,
        payment: {
          method: "cod",
          status: "pending", // Always pending initially
        },
        pricing: {
          subtotal: calculatedSubtotal,
          tax: 0, // Tax can be added here if needed
          shippingFee: deliveryFee,
          discount: discount,
          total: calculatedTotal,
        },
        coupon: couponData,
        fulfillment: {
          originalTotal: calculatedTotal,
          needsCustomerAction: false,
        },
        notes: notes || undefined,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        deliveryTimeSlot: deliveryTimeSlot || undefined,
        statusHistory: [
          {
            status: "pending",
            note: "Order placed",
            updatedAt: new Date(),
          },
        ],
      });

      await reserveSlot(deliveryDateId);

      if (couponDoc) {
        couponDoc.isUsed = true;
        couponDoc.usedAt = new Date();
        couponDoc.usedOnOrder = order._id;
        await couponDoc.save();
      }

      if (paymentMethod === "cod") {
        // Clear user's cart
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

        res.status(201).json({
          success: true,
          message: "Order placed successfully! Pay on delivery.",
          data: order,
        });

        // Everything below runs after the response has already been sent.
        (async () => {
          try {
            const user = await User.findById(req.user._id);
            await sendOrderConfirmationEmail(order, user);
          } catch (emailError) {
            console.error(
              "❌ Failed to send order confirmation email:",
              emailError,
            );
          }

          try {
            await sendAdminOrderNotificationEmail(order, req.user);
          } catch (adminEmailError) {
            console.error(
              "❌ Failed to send admin order notification email:",
              adminEmailError,
            );
          }

          try {
            await Notification.createNotification(order.user, {
              type: "order_created",
              title: "Order Placed Successfully",
              message: `Your order #${order.orderNumber} has been placed successfully. You will pay ₹${order.pricing.total} on delivery.`,
              order: order._id,
              data: {
                orderNumber: order.orderNumber,
                status: "pending",
                total: order.pricing.total,
                paymentMethod: "COD",
              },
            });
          } catch (notificationError) {
            console.error(
              "❌ Failed to create order notification:",
              notificationError,
            );
          }

          try {
            await orderNotificationService.sendOrderWhatsAppNotifications(
              order,
              req.user,
            );
          } catch (whatsappError) {
            console.error(
              "❌ Failed to send WhatsApp order notifications:",
              whatsappError,
            );
          }
        })();
      } else {
        // For online payment: Don't clear cart or send email yet
        // These will be done after successful payment verification

        // Create notification for online payment order creation
        try {
          await Notification.createNotification(order.user, {
            type: "order_created",
            title: "Order Created",
            message: `Your order #${order.orderNumber} has been created. Please complete the payment of ₹${order.pricing.total}.`,
            order: order._id,
            data: {
              orderNumber: order.orderNumber,
              status: "pending",
              total: order.pricing.total,
              // paymentMethod: "Online",
            },
          });
        } catch (notificationError) {
          console.error(
            "❌ Failed to create order notification:",
            notificationError,
          );
          // Don't fail the order if notification fails
        }

        res.status(201).json({
          success: true,
          message: "Order placed successfully!",
          data: order,
        });
      }
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create order",
        error: error.message,
      });
    }
  }

  /**
   * Lets the customer edit their own order — item quantities/removal,
   * delivery address, delivery date/slot, and notes — while it's still
   * pending or confirmed. Once it enters processing (or later) it can no
   * longer be changed here. Items are never added, only adjusted/removed,
   * since prices are locked to what was charged at checkout.
   * @route PUT /api/orders/:id
   * @access Private (order owner only)
   */
  async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const { items, addressId, deliveryDate, deliveryTimeSlot, notes } =
        req.body;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Order.user comes back populated (see the schema-wide pre(/^find/)
      // hook), so it's a User document here, not a plain ObjectId.
      const orderUserId =
        typeof order.user === "object" && order.user._id
          ? order.user._id.toString()
          : order.user.toString();

      if (orderUserId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this order",
        });
      }

      // Editing closes once the order enters processing — cancellation
      // (cancelOrder, below) stays allowed a bit longer.
      const EDITABLE_STATUSES = ["pending", "confirmed"];
      if (!EDITABLE_STATUSES.includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `This order can no longer be edited (status: ${order.status}).`,
        });
      }

      // Human-readable before/after per changed field, shown to admins on
      // the order (see editHistory on the model).
      const changes = [];
      const originalTotal = order.pricing.total;

      // --- Items: adjust quantity or remove; never add new products ---
      if (Array.isArray(items) && items.length > 0) {
        const updatesById = new Map(
          items.map((i) => [i._id, Number(i.quantity)]),
        );

        order.items.forEach((item) => {
          const newQty = updatesById.get(item._id.toString());
          if (newQty === undefined) return;
          if (newQty <= 0) {
            changes.push({
              field: "Item removed",
              previous: `${item.name} — qty ${item.quantity}`,
              updated: "Removed",
            });
          } else if (newQty !== item.quantity) {
            changes.push({
              field: `Quantity — ${item.name}`,
              previous: item.quantity,
              updated: newQty,
            });
          }
        });

        order.items = order.items.filter((item) => {
          const update = updatesById.get(item._id.toString());
          return update === undefined || update > 0;
        });

        order.items.forEach((item) => {
          const newQty = updatesById.get(item._id.toString());
          if (newQty > 0) {
            item.quantity = newQty;
            item.fulfilledQuantity = newQty;
            item.subtotal = item.price * newQty;
          }
        });

        if (order.items.length === 0) {
          return res.status(400).json({
            success: false,
            message:
              "An order must have at least one item — cancel the order instead of removing everything.",
          });
        }
      }

      // --- Delivery address ---
      if (addressId) {
        const user = await User.findById(req.user._id);
        const address = user.addresses.id(addressId);
        if (!address) {
          return res.status(400).json({
            success: false,
            message: "Address not found",
          });
        }
        if (!isPincodeServiceable(address.zipCode)) {
          return res.status(400).json({
            success: false,
            message: NON_SERVICEABLE_MESSAGE,
            code: "PINCODE_NOT_SERVICEABLE",
          });
        }

        const oldAddr = order.shippingAddress;
        const formatAddr = (a) =>
          `${a.street}, ${a.city}, ${a.state} - ${a.zipCode}`;
        const newAddrLine = formatAddr(address);
        if (formatAddr(oldAddr) !== newAddrLine) {
          changes.push({
            field: "Delivery address",
            previous: formatAddr(oldAddr),
            updated: newAddrLine,
          });
        }

        order.shippingAddress = {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          area: address.area,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country || "India",
          landmark: address.landmark,
        };
      }

      // --- Delivery date / slot (releases the old capacity slot and
      // reserves the new one, same as at checkout) ---
      if (deliveryDate) {
        const newDateId = toDateId(deliveryDate);
        const oldDateId = order.deliveryDate
          ? toDateId(order.deliveryDate)
          : null;

        if (newDateId !== oldDateId) {
          if (!isTodayOrTomorrow(newDateId)) {
            return res.status(400).json({
              success: false,
              message: "Delivery date must be today or tomorrow",
              code: "DELIVERY_DATE_UNAVAILABLE",
            });
          }
          const availability = await getAvailability([newDateId]);
          if (!availability[newDateId]) {
            return res.status(400).json({
              success: false,
              message:
                "Selected delivery date is no longer available. Please choose another date.",
              code: "DELIVERY_DATE_UNAVAILABLE",
            });
          }
          await reserveSlot(newDateId);
          if (oldDateId) await releaseSlot(oldDateId);
          changes.push({
            field: "Delivery date",
            previous: oldDateId || "Not set",
            updated: newDateId,
          });
          order.deliveryDate = new Date(deliveryDate);
        }
      }

      if (deliveryTimeSlot && deliveryTimeSlot !== order.deliveryTimeSlot) {
        changes.push({
          field: "Delivery time slot",
          previous: order.deliveryTimeSlot || "Not set",
          updated: deliveryTimeSlot,
        });
        order.deliveryTimeSlot = deliveryTimeSlot;
      }

      if (notes !== undefined && notes !== (order.notes || "")) {
        changes.push({
          field: "Delivery instructions",
          previous: order.notes || "(none)",
          updated: notes || "(none)",
        });
        order.notes = notes;
      }

      // --- Recalculate pricing from the (possibly changed) items ---
      const subtotal = order.items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
      const discount = order.pricing.discount || 0;
      const shippingFee = subtotal > 199 ? 0 : 25;
      const total = Math.max(0, subtotal - discount + shippingFee);

      order.pricing.subtotal = subtotal;
      order.pricing.shippingFee = shippingFee;
      order.pricing.total = total;

      if (total !== originalTotal) {
        changes.push({
          field: "Order total",
          previous: `₹${originalTotal}`,
          updated: `₹${total}`,
        });
      }

      if (changes.length > 0) {
        order.editHistory.push({
          editedAt: new Date(),
          editedBy: "customer",
          changes,
        });
        order.statusHistory.push({
          status: order.status,
          note: "Order updated by customer",
          updatedAt: new Date(),
        });
      }

      await order.save();

      res.json({
        success: true,
        message: "Order updated successfully",
        data: order,
      });

      // Email the customer a summary of what changed, without holding up
      // the response on SMTP (same reasoning as the order-creation flow).
      if (changes.length > 0) {
        const emailUser =
          typeof order.user === "object" && order.user.email
            ? order.user
            : await User.findById(orderUserId);
        sendOrderUpdatedEmail(order, emailUser, changes).catch((emailError) => {
          console.error("❌ Failed to send order updated email:", emailError);
        });
      }
    } catch (error) {
      console.error("Update order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order",
        error: error.message,
      });
    }
  }

  /**
   * Update order status
   * @route PUT /api/orders/:id/status
   * @access Private (Admin only)
   */
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note, cancellationReason, cancelledBy } = req.body;

      const validStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Prevent admin from updating customer-cancelled orders
      if (order.status === "cancelled" && order.cancelledBy === "customer") {
        return res.status(403).json({
          success: false,
          message: "Cannot update order cancelled by customer",
          cancelledBy: "customer",
          cancellationReason: order.cancellationReason,
        });
      }

      const previousStatus = order.status;

      // An order can't be delivered while its payment is unsettled. A COD
      // order marked delivered by an admin is recorded as cash received
      // (the implicit behaviour before payment tracking existed); anything
      // else with unsettled payment (e.g. failed prepayment) is rejected.
      if (
        status === "delivered" &&
        previousStatus !== "delivered" &&
        order.payment?.status !== "completed"
      ) {
        if (
          order.payment?.method === "cod" &&
          order.payment?.status === "pending"
        ) {
          order.payment.status = "completed";
          order.payment.collectedMethod = "cash";
          order.payment.collectedBy = req.user._id;
          order.payment.collectedAt = new Date();
          order.payment.paidAt = new Date();
          order.statusHistory.push({
            status: previousStatus,
            note: "Cash on delivery recorded as received by admin when marking the order delivered",
          });
        } else {
          return res.status(400).json({
            success: false,
            message: `Cannot mark as delivered: payment is ${order.payment?.status || "unsettled"}.`,
          });
        }
      }

      // Handle stock updates based on status change
      if (
        status === "confirmed" &&
        (previousStatus === "pending" ||
          previousStatus === "cancelled" ||
          previousStatus === "refunded")
      ) {
        // Reduce stock when order is confirmed from pending, cancelled, or
        // refunded — this is the "check actual stock before preparing"
        // gate. Reads each item's resolved fulfillment target (a removed
        // item deducts nothing; a replaced item deducts from the
        // replacement product instead) rather than the original quantity.
        for (const item of order.items) {
          const { productId, qty } =
            orderFulfillmentService.getFulfillmentTarget(item);
          if (qty <= 0) continue;

          const product = await Product.findById(productId);
          if (product) {
            if (product.trackInventory && product.stock < qty) {
              return res.status(400).json({
                success: false,
                message: `${product.name}: Insufficient stock (available: ${product.stock}, required: ${qty})`,
              });
            }
            if (product.trackInventory) {
              product.stock -= qty;
              await product.save();
            }
          }
        }

        // Create Shiprocket order when admin confirms the order
        try {
          const orderWithDetails = await Order.findById(id)
            .populate("user")
            .populate("items.product");

          const shiprocketResponse =
            await shipRocketService.createOrder(orderWithDetails);

          if (shiprocketResponse.order_id) {
            // Update order with Shiprocket details
            order.shiprocketOrderId = shiprocketResponse.order_id;
            order.shiprocketShipmentId = shiprocketResponse.shipment_id;

            // Generate AWB and request pickup for next day
            try {
              const awbResponse = await shipRocketService.generateAWB(
                shiprocketResponse.shipment_id,
              );

              if (awbResponse.response?.data?.awb_code) {
                order.trackingNumber = awbResponse.response.data.awb_code;
                order.courierName = awbResponse.response.data.courier_name;
              }

              // Request pickup for next day
              await shipRocketService.requestPickup(
                shiprocketResponse.shipment_id,
              );
            } catch (awbError) {
              console.error(
                "Error generating AWB or requesting pickup:",
                awbError,
              );
              // Continue even if AWB generation fails
            }
          }
        } catch (shiprocketError) {
          console.error("Error creating Shiprocket order:", shiprocketError);
          // Don't fail the status update if Shiprocket fails
          // Admin can manually create the shipment
        }
      } else if (
        (status === "cancelled" || status === "refunded") &&
        (previousStatus === "confirmed" ||
          previousStatus === "processing" ||
          previousStatus === "shipped")
      ) {
        // Restore stock when order is cancelled or refunded (only if it was confirmed before)
        for (const item of order.items) {
          const { productId, qty } =
            orderFulfillmentService.getFulfillmentTarget(item);
          if (qty <= 0) continue;

          const product = await Product.findById(productId);
          if (product) {
            if (product.trackInventory) {
              product.stock += qty;
              await product.save();
            }
          }
        }
        await releaseSlot(order.deliveryDate);
      } else if (status === "confirmed" && previousStatus !== "confirmed") {
        // Increment sales count when order is confirmed for the first time
        for (const item of order.items) {
          const { productId, qty } =
            orderFulfillmentService.getFulfillmentTarget(item);
          if (qty <= 0) continue;
          await Product.findByIdAndUpdate(productId, {
            $inc: { salesCount: qty },
          });
        }
      } else if (status === "delivered" && previousStatus !== "delivered") {
        // Keep delivered logic for backward compatibility (no change needed)
      } else if (
        (status === "cancelled" || status === "refunded") &&
        (previousStatus === "confirmed" ||
          previousStatus === "processing" ||
          previousStatus === "shipped" ||
          previousStatus === "delivered")
      ) {
        // Decrement sales count when confirmed order is cancelled/refunded
        for (const item of order.items) {
          const { productId, qty } =
            orderFulfillmentService.getFulfillmentTarget(item);
          if (qty <= 0) continue;
          await Product.findByIdAndUpdate(productId, {
            $inc: { salesCount: -qty },
          });
        }
      }

      // Mark as cancelled by admin when admin sets status to cancelled
      if (status === "cancelled") {
        order.cancelledBy = cancelledBy || "admin";
        if (cancellationReason) {
          order.cancellationReason = cancellationReason;
        } else if (note) {
          order.cancellationReason = note;
        }
      }

      await order.updateStatus(status, note);

      // Send status update email
      try {
        const user = await User.findById(order.user);
        if (user && status === "shipped" && order.tracking?.trackingNumber) {
          // Send shipping notification with tracking info
          await sendOrderShippedEmail(order, user, {
            trackingNumber: order.tracking.trackingNumber,
            courierName: order.tracking.courierName || "Standard Delivery",
            estimatedDelivery: order.tracking.estimatedDelivery,
          });
        }
        // For other statuses (processing, delivered, cancelled), implement as needed
      } catch (emailError) {
        console.error("❌ Failed to send status update email:", emailError);
        // Don't fail the status update if email fails
      }

      // Notify the customer (shared with the delivery-partner flow)
      await notifyCustomerOfStatus(order, status);

      // Every 10th delivered order earns the customer a loyalty coupon.
      if (status === "delivered" && previousStatus !== "delivered") {
        await grantLoyaltyOnDelivery(order);
      }

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order status",
        error: error.message,
      });
    }
  }

  /**
   * Cancel order with Shiprocket cancellation and Razorpay refund
   * @route POST /api/orders/:id/cancel
   * @access Private
   */
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if user owns this order or is admin
      const cancelOrderUserId =
        typeof order.user === "object" && order.user._id
          ? order.user._id.toString()
          : order.user.toString();
      const isOwner = cancelOrderUserId === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to cancel this order",
        });
      }

      // Check if order can be cancelled
      if (["shipped", "delivered", "cancelled"].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order with status: ${order.status}`,
        });
      }

      const cancellationResults = {
        orderCancelled: false,
        shiprocketCancelled: false,
        refundProcessed: false,
        stockRestored: false,
        errors: [],
      };

      // STEP 1: Cancel Shiprocket shipment (if exists)

      // return
      if (order.shiprocketShipmentId) {
        try {
          const cancelResult = await cancelShiprocketShipment(
            order.shiprocketShipmentId,
          );
          if (cancelResult.success) {
            cancellationResults.shiprocketCancelled = true;
            order.statusHistory.push({
              status: "cancelled",
              note: "Shipment cancelled in Shiprocket",
              updatedAt: new Date(),
            });
          }
        } catch (shipError) {
          console.error(
            "❌ Shiprocket cancellation failed:",
            shipError.message,
          );
          cancellationResults.errors.push(`Shiprocket: ${shipError.message}`);
          // Continue with order cancellation even if Shiprocket fails
        }
      }

      // STEP 2: Process refund for prepaid orders
      const isPrepaid = order.payment?.method !== "cod";
      const isPaymentCompleted = order.payment?.status === "completed";
      const hasRazorpayPaymentId = !!order.razorpayPaymentId;
      const isRefundNotProcessed = !order.refund?.id;

      if (
        isPrepaid &&
        isPaymentCompleted &&
        hasRazorpayPaymentId &&
        isRefundNotProcessed
      ) {
        try {
          const refundAmount = order.pricing?.total || 0;

          // Step 1: Create the refund
          const refund = await createRefund(
            order.razorpayPaymentId,
            refundAmount,
          );

          // Step 2: Fetch complete refund details with timeline
          const completeRefundData = await fetchRefund(
            order.razorpayPaymentId,
            refund.id,
          );

          // Step 3: Store complete refund information
          order.refund = {
            id: completeRefundData.id,
            paymentId: completeRefundData.payment_id,
            amount: completeRefundData.amount / 100, // Convert paise to rupees
            currency: completeRefundData.currency,
            status: completeRefundData.status,
            speed:
              completeRefundData.speed_requested ||
              completeRefundData.speed_processed ||
              "normal",
            notes: completeRefundData.notes || {},
            createdAt: new Date(completeRefundData.created_at * 1000),
            processedAt: completeRefundData.processed_at
              ? new Date(completeRefundData.processed_at * 1000)
              : new Date(),
            batchId: completeRefundData.batch_id || null,
            razorpayData: completeRefundData, // Store complete Razorpay response
          };

          order.payment.status = "refunded";
          cancellationResults.refundProcessed = true;

          order.statusHistory.push({
            status: "cancelled",
            note: `Refund initiated: ₹${refundAmount} (Refund ID: ${refund.id}, Status: ${completeRefundData.status})`,
            updatedAt: new Date(),
          });
        } catch (refundError) {
          console.error("❌ Refund processing failed:", refundError.message);
          cancellationResults.errors.push(`Refund: ${refundError.message}`);

          // Mark refund as failed
          order.refund = {
            status: "failed",
            amount: order.pricing?.total || 0,
            failureReason: refundError.message,
            processedAt: new Date(),
          };
          // Continue with order cancellation even if refund fails
        }
      }
      // STEP 3: Restore product stock — only if this order had actually
      // had stock deducted for it (i.e. it was confirmed/processing/
      // shipped already; a still-"pending" order never touched stock in
      // the first place, see updateOrderStatus). Reads each item's
      // resolved fulfillment target so a replaced/removed item restores
      // the right product/quantity, not the originally-ordered one.
      try {
        if (
          orderFulfillmentService.STATUSES_WITH_STOCK_DEDUCTED.includes(
            order.status,
          )
        ) {
          for (const item of order.items) {
            const { productId, qty } =
              orderFulfillmentService.getFulfillmentTarget(item);
            if (qty <= 0) continue;
            const product = await Product.findById(productId);
            if (product?.trackInventory) {
              await Product.findByIdAndUpdate(productId, {
                $inc: { stock: qty },
              });
            }
          }
        }
        cancellationResults.stockRestored = true;
      } catch (stockError) {
        console.error("❌ Error restoring stock:", stockError.message);
        cancellationResults.errors.push(`Stock: ${stockError.message}`);
      }

      // Release the delivery capacity this order had reserved
      try {
        await releaseSlot(order.deliveryDate);
      } catch (capacityError) {
        console.error(
          "❌ Error releasing delivery capacity:",
          capacityError.message,
        );
      }

      // STEP 4: Update order status to cancelled
      order.cancellationReason = reason || "No reason provided";
      order.cancelledBy = isAdmin ? "admin" : "customer";
      await order.updateStatus(
        "cancelled",
        `Cancelled by ${order.cancelledBy}: ${reason || "No reason provided"}`,
      );
      cancellationResults.orderCancelled = true;

      // Create notification for order cancellation
      try {
        let notificationMessage = `Your order #${order.orderNumber} has been cancelled`;

        if (cancellationResults.refundProcessed) {
          notificationMessage += `. Refund of ₹${order.pricing?.total} has been initiated and will be processed within 5-7 business days`;
        } else if (order.payment?.method === "cod") {
          notificationMessage += ". No payment was made for this order";
        }

        if (reason) {
          notificationMessage += `. Reason: ${reason}`;
        }

        await Notification.createNotification(order.user, {
          type: "order_cancelled",
          title: "Order Cancelled",
          message: notificationMessage,
          order: order._id,
          data: {
            orderNumber: order.orderNumber,
            status: "cancelled",
            cancelledBy: order.cancelledBy,
            reason: reason || "No reason provided",
            refundProcessed: cancellationResults.refundProcessed,
            refundAmount: cancellationResults.refundProcessed
              ? order.pricing?.total
              : 0,
          },
        });
      } catch (notificationError) {
        console.error(
          "❌ Failed to create cancellation notification:",
          notificationError,
        );
        // Don't fail the cancellation if notification fails
      }

      // Prepare response message
      let message = "Order cancelled successfully";
      if (cancellationResults.refundProcessed) {
        message += `. Refund of ₹${order.pricing?.total} has been initiated`;
      }
      if (cancellationResults.errors.length > 0) {
        message += `. Note: ${cancellationResults.errors.join(", ")}`;
      }

      res.json({
        success: true,
        message,
        data: order,
        cancellationSummary: cancellationResults,
      });
    } catch (error) {
      console.error("❌ Cancel order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel order",
        error: error.message,
      });
    }
  }

  /**
   * Refresh refund status from Razorpay
   * @route POST /api/orders/:id/refund/refresh
   * @access Private
   */
  async refreshRefundStatus(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if user owns this order or is admin
      const isOwner = order.user._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this order",
        });
      }

      // Check if order has a refund
      if (!order.refund?.id) {
        return res.status(400).json({
          success: false,
          message: "No refund found for this order",
        });
      }

      try {
        // Fetch latest refund data from Razorpay
        const completeRefundData = await fetchRefund(
          order.razorpayPaymentId,
          order.refund.id,
        );

        // Update order with latest refund information
        order.refund = {
          id: completeRefundData.id,
          paymentId: completeRefundData.payment_id,
          amount: completeRefundData.amount / 100,
          currency: completeRefundData.currency,
          status: completeRefundData.status,
          speed:
            completeRefundData.speed_requested ||
            completeRefundData.speed_processed ||
            "normal",
          notes: completeRefundData.notes || {},
          createdAt: new Date(completeRefundData.created_at * 1000),
          processedAt: completeRefundData.processed_at
            ? new Date(completeRefundData.processed_at * 1000)
            : order.refund.processedAt,
          batchId: completeRefundData.batch_id || null,
          razorpayData: completeRefundData,
        };

        await order.save();

        res.json({
          success: true,
          message: "Refund status updated successfully",
          data: order,
        });
      } catch (fetchError) {
        console.error("❌ Error fetching refund status:", fetchError.message);
        res.status(500).json({
          success: false,
          message: "Failed to fetch refund status from Razorpay",
          error: fetchError.message,
        });
      }
    } catch (error) {
      console.error("❌ Refresh refund status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to refresh refund status",
        error: error.message,
      });
    }
  }

  /**
   * Get all orders (Admin only)
   * @route GET /api/orders/admin/all
   * @access Private (Admin only)
   */
  async getAllOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        sort = "-createdAt",
        search,
      } = req.query;

      // Build query - by default show all orders; if no status filter exclude cancelled
      const query = {};

      if (status) {
        query.status = status;
      } else {
        query.status = { $ne: "cancelled" };
      }

      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: "i" } },
          { "shippingAddress.phone": { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;
      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate("user", "firstName lastName email phone")
          .sort(sort)
          .skip(skip)
          .limit(Number(limit)),
        Order.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get all orders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
    }
  }

  /**
   * Track shipment
   * @route GET /api/orders/:id/track
   * @access Private
   */
  async trackShipment(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if user owns this order or is admin
      if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this order",
        });
      }

      if (!order.shiprocketShipmentId) {
        return res.status(400).json({
          success: false,
          message: "Shipment tracking not available for this order",
        });
      }

      // Get tracking information from Shiprocket
      const trackingInfo = await shipRocketService.trackShipment(
        order.shiprocketShipmentId,
      );

      res.json({
        success: true,
        data: trackingInfo,
      });
    } catch (error) {
      console.error("Track shipment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to track shipment",
        error: error.message,
      });
    }
  }

  /**
   * Update order with shipment information
   * @route PUT /api/orders/:id/shipment
   * @access Private (Admin only)
   */
  async updateOrderShipment(req, res) {
    try {
      const { id } = req.params;
      const { shipmentOrderId, shipmentId, awb, courier } = req.body;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Update shipment fields
      if (shipmentOrderId) order.shiprocketOrderId = shipmentOrderId;
      if (shipmentId) order.shiprocketShipmentId = shipmentId;
      if (awb) order.awbCode = awb;
      if (courier) order.courierName = courier;

      await order.save();

      res.json({
        success: true,
        message: "Order shipment information updated successfully",
        data: order,
      });
    } catch (error) {
      console.error("Update order shipment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order shipment information",
        error: error.message,
      });
    }
  }
}

export default new OrderController();
