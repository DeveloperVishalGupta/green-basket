import Order from "../models/Order.js";
import User from "../models/User.js";
import { compareByDeliverySchedule } from "../utils/deliverySlot.js";
import {
  checkDeliverable,
  grantLoyaltyOnDelivery,
  isTransitionAllowed,
  notifyCustomerOfPayment,
  notifyCustomerOfStatus,
  ROLE_STATUS_TRANSITIONS,
} from "../services/orderStatusService.js";

/**
 * Delivery Partner Controller
 * Order, delivery-status and payment-collection workflow for delivery
 * partners. All state lives on the Order document (the single source of
 * truth) — customer, admin and vendor views read the same fields.
 *
 * Workflow:  processing → shipped → delivered  (payment must be settled first)
 */

const ACTIVE_STATUSES = ["processing", "shipped"];

const isValidLocation = (loc) =>
  loc &&
  Number.isFinite(loc.lat) &&
  Number.isFinite(loc.lng) &&
  Math.abs(loc.lat) <= 90 &&
  Math.abs(loc.lng) <= 180 &&
  !(loc.lat === 0 && loc.lng === 0);

const idOf = (v) => (v && v._id ? String(v._id) : v ? String(v) : null);

/**
 * Shape an order for the delivery app — everything the partner needs, and
 * none of the internal gateway/WhatsApp fields.
 */
const serializeOrder = (order, partnerId) => {
  const o = order.toObject ? order.toObject() : order;
  const assignedTo = idOf(o.deliveryPartner);
  const assignedToMe = assignedTo === String(partnerId);
  const loc = o.shippingAddress?.location;

  return {
    _id: o._id,
    orderNumber: o.orderNumber,
    status: o.status,
    statusHistory: o.statusHistory,
    createdAt: o.createdAt,
    deliveredAt: o.deliveredAt,
    deliveryDate: o.deliveryDate,
    deliveryTimeSlot: o.deliveryTimeSlot,
    notes: o.notes,
    customer: {
      name: o.user ? `${o.user.firstName} ${o.user.lastName}`.trim() : "",
      phone: o.shippingAddress?.phone || o.user?.phone || "",
      email: o.user?.email || "",
    },
    shippingAddress: {
      label: o.shippingAddress?.label,
      street: o.shippingAddress?.street,
      city: o.shippingAddress?.city,
      state: o.shippingAddress?.state,
      zipCode: o.shippingAddress?.zipCode,
      country: o.shippingAddress?.country,
      phone: o.shippingAddress?.phone,
      formattedAddress: o.shippingAddress?.formattedAddress,
      // Only ever exposed when usable, so the app can trust it for routing
      location: isValidLocation(loc) ? { lat: loc.lat, lng: loc.lng } : null,
    },
    items: (o.items || []).map((i) => {
      const quantity = i.fulfilledQuantity ?? i.quantity;
      return {
        _id: i._id,
        name: i.name,
        image: i.image || i.product?.images?.[0]?.url,
        variant: i.variant,
        orderedQuantity: i.quantity,
        quantity,
        removed: quantity === 0,
        price: i.price,
        subtotal: i.subtotal,
      };
    }),
    pricing: o.pricing,
    coupon: o.coupon?.code ? o.coupon : undefined,
    payment: {
      method: o.payment?.method,
      status: o.payment?.status,
      collectedMethod: o.payment?.collectedMethod,
      collectedAt: o.payment?.collectedAt,
      paidAt: o.payment?.paidAt,
      transactionId: o.payment?.transactionId,
    },
    assignedToMe,
    availableToClaim: !assignedTo && o.status === "processing",
    // What this partner may do next, so the UI never invents transitions
    allowedNextStatuses: assignedToMe
      ? ROLE_STATUS_TRANSITIONS.delivery_partner[o.status] || []
      : [],
    canCollectPayment:
      assignedToMe &&
      ACTIVE_STATUSES.includes(o.status) &&
      o.payment?.status !== "completed",
  };
};

/**
 * Customer-sensitive details (identity, phone, exact address, coordinates,
 * delivery notes) are only released while the order is the partner's own
 * *active* delivery: assigned to them and still processing/shipped. Before
 * acceptance (available orders) and after completion they get the limited
 * view below. This is the single place that decides it — every endpoint
 * serializes through serializeForPartner.
 */
const canViewFullDetails = (o, partnerId) =>
  idOf(o.deliveryPartner) === String(partnerId) &&
  ACTIVE_STATUSES.includes(o.status);

/** Order reference info only — no customer or location data */
const serializeLimited = (order, partnerId) => {
  const o = order.toObject ? order.toObject() : order;
  const assignedTo = idOf(o.deliveryPartner);
  const items = (o.items || []).filter(
    (i) => (i.fulfilledQuantity ?? i.quantity) > 0,
  );
  const availableToClaim = !assignedTo && o.status === "processing";

  return {
    view: "limited",
    _id: o._id,
    orderNumber: o.orderNumber,
    status: o.status,
    createdAt: o.createdAt,
    deliveredAt: o.deliveredAt,
    deliveryDate: o.deliveryDate,
    deliveryTimeSlot: o.deliveryTimeSlot,
    itemCount: items.length,
    itemsSummary: items.map((i) => ({
      name: i.name,
      variant: i.variant,
      quantity: i.fulfilledQuantity ?? i.quantity,
    })),
    total: o.pricing?.total,
    payment: {
      method: o.payment?.method,
      status: o.payment?.status,
      collectedMethod: o.payment?.collectedMethod,
      paidAt: o.payment?.paidAt,
    },
    // Coarse delivery area only, and only to help pick an order to accept
    area: availableToClaim
      ? { city: o.shippingAddress?.city, zipCode: o.shippingAddress?.zipCode }
      : undefined,
    assignedToMe: assignedTo === String(partnerId),
    availableToClaim,
  };
};

const serializeForPartner = (order, partnerId) =>
  canViewFullDetails(order, partnerId)
    ? { view: "full", ...serializeOrder(order, partnerId) }
    : serializeLimited(order, partnerId);

/** Compact shape for the list view (full or limited, per the rules above) */
const serializeSummary = (order, partnerId) => {
  const v = serializeForPartner(order, partnerId);
  if (v.view === "limited") return v;

  return {
    view: "full",
    _id: v._id,
    orderNumber: v.orderNumber,
    status: v.status,
    createdAt: v.createdAt,
    deliveryDate: v.deliveryDate,
    deliveryTimeSlot: v.deliveryTimeSlot,
    customer: { name: v.customer.name, phone: v.customer.phone },
    shippingAddress: {
      street: v.shippingAddress.street,
      city: v.shippingAddress.city,
      zipCode: v.shippingAddress.zipCode,
      location: v.shippingAddress.location,
    },
    itemCount: v.items.filter((i) => !i.removed).length,
    total: v.pricing?.total,
    payment: {
      method: v.payment.method,
      status: v.payment.status,
      collectedMethod: v.payment.collectedMethod,
    },
    assignedToMe: v.assignedToMe,
    availableToClaim: v.availableToClaim,
  };
};

const fail = (res, status, message, extra = {}) =>
  res.status(status).json({ success: false, message, ...extra });

/**
 * Load an order and make sure it's assigned to the calling partner.
 * Sends the error response itself and returns null when not allowed.
 */
const loadAssignedOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    fail(res, 404, "Order not found");
    return null;
  }
  if (idOf(order.deliveryPartner) !== String(req.user._id)) {
    fail(res, 403, "This order is not assigned to you");
    return null;
  }
  return order;
};

class DeliveryPartnerController {
  /**
   * List orders for the partner
   * @route GET /api/delivery-partner/orders?scope=available|active|completed
   */
  async listOrders(req, res) {
    try {
      const me = req.user._id;
      const scope = req.query.scope || "available";

      const queries = {
        // Processing orders nobody has taken yet
        available: { status: "processing", deliveryPartner: { $in: [null] } },
        // Orders this partner has accepted and still has to deliver
        active: { deliveryPartner: me, status: { $in: ACTIVE_STATUSES } },
        completed: { deliveryPartner: me, status: "delivered" },
      };
      if (!queries[scope]) return fail(res, 400, "Invalid scope");

      const [orders, available, active, completed] = await Promise.all([
        // History is capped to the most recent deliveries; the others are
        // small working sets. Everything is then put in schedule order below.
        scope === "completed"
          ? Order.find(queries.completed).sort("-deliveredAt").limit(100)
          : Order.find(queries[scope]),
        Order.countDocuments(queries.available),
        Order.countDocuments(queries.active),
        Order.countDocuments(queries.completed),
      ]);

      // Chronological: delivery date, then slot start time (parsed from the
      // stored slot, not from any display string)
      orders.sort(compareByDeliverySchedule);

      res.json({
        success: true,
        data: orders.map((o) => serializeSummary(o, me)),
        counts: { available, active, completed },
      });
    } catch (error) {
      console.error("Delivery list orders error:", error);
      fail(res, 500, "Failed to fetch orders");
    }
  }

  /**
   * Full order details. Visible when assigned to the partner, or while it is
   * an unclaimed processing order they might accept.
   * @route GET /api/delivery-partner/orders/:id
   */
  async getOrder(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return fail(res, 404, "Order not found");

      const assignedTo = idOf(order.deliveryPartner);
      const mine = assignedTo === String(req.user._id);
      const claimable = !assignedTo && order.status === "processing";
      if (!mine && !claimable) {
        return fail(res, 403, "This order is not assigned to you");
      }

      // Full customer details only for the partner's own active delivery;
      // available and completed orders get the limited view.
      res.json({ success: true, data: serializeForPartner(order, req.user._id) });
    } catch (error) {
      console.error("Delivery get order error:", error);
      fail(res, 500, "Failed to fetch order");
    }
  }

  /**
   * Accept (claim) an available processing order. Atomic, so two partners
   * can't take the same order.
   * @route POST /api/delivery-partner/orders/:id/accept
   */
  async acceptOrder(req, res) {
    try {
      const order = await Order.findOneAndUpdate(
        {
          _id: req.params.id,
          status: "processing",
          deliveryPartner: { $in: [null] },
        },
        {
          $set: {
            deliveryPartner: req.user._id,
            deliveryPartnerAssignedAt: new Date(),
          },
          $push: {
            statusHistory: {
              status: "processing",
              note: `Accepted for delivery by ${req.user.firstName} ${req.user.lastName}`,
            },
          },
        },
        { new: true },
      );

      if (!order) {
        const existing = await Order.findById(req.params.id);
        if (!existing) return fail(res, 404, "Order not found");
        return fail(
          res,
          409,
          existing.status !== "processing"
            ? `Order is ${existing.status} and can no longer be accepted`
            : "This order has already been taken by another delivery partner",
        );
      }

      res.json({
        success: true,
        message: "Order accepted",
        data: serializeForPartner(order, req.user._id),
      });
    } catch (error) {
      console.error("Delivery accept order error:", error);
      fail(res, 500, "Failed to accept order");
    }
  }

  /**
   * Move an assigned order along processing → shipped → delivered.
   * @route PUT /api/delivery-partner/orders/:id/status
   */
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const order = await loadAssignedOrder(req, res);
      if (!order) return;

      if (!isTransitionAllowed("delivery_partner", order.status, status)) {
        const allowed =
          ROLE_STATUS_TRANSITIONS.delivery_partner[order.status] || [];
        return fail(
          res,
          400,
          allowed.length
            ? `Order is ${order.status}; it can only be moved to: ${allowed.join(", ")}`
            : `Order is ${order.status} and can't be updated by a delivery partner`,
        );
      }

      if (status === "delivered") {
        const check = checkDeliverable(order);
        if (!check.ok) {
          return fail(res, 400, check.message, { code: "PAYMENT_PENDING" });
        }
      }

      const set = { status };
      if (status === "delivered") set.deliveredAt = new Date();

      // Guarded on the status we validated against, so a concurrent update
      // (e.g. admin cancelling) can't be silently overwritten.
      const updated = await Order.findOneAndUpdate(
        {
          _id: order._id,
          deliveryPartner: req.user._id,
          status: order.status,
          ...(status === "delivered" ? { "payment.status": "completed" } : {}),
        },
        {
          $set: set,
          $push: {
            statusHistory: {
              status,
              note: `Updated by delivery partner ${req.user.firstName} ${req.user.lastName}`,
            },
          },
        },
        { new: true },
      );

      if (!updated) {
        return fail(
          res,
          409,
          "The order changed while you were updating it. Please refresh and try again.",
        );
      }

      await notifyCustomerOfStatus(updated, status);
      if (status === "delivered") await grantLoyaltyOnDelivery(updated);

      res.json({
        success: true,
        message: `Order marked as ${status}`,
        data: serializeForPartner(updated, req.user._id),
      });
    } catch (error) {
      console.error("Delivery update status error:", error);
      fail(res, 500, "Failed to update order status");
    }
  }

  /**
   * Record cash received for an assigned order.
   * @route POST /api/delivery-partner/orders/:id/payment/cash
   */
  async collectCash(req, res) {
    try {
      const order = await loadAssignedOrder(req, res);
      if (!order) return;

      if (!ACTIVE_STATUSES.includes(order.status)) {
        return fail(res, 400, `Order is ${order.status}; payment can't be recorded`);
      }
      if (order.payment?.status === "completed") {
        return fail(res, 409, "Payment has already been received for this order");
      }

      const now = new Date();
      const updated = await Order.findOneAndUpdate(
        {
          _id: order._id,
          deliveryPartner: req.user._id,
          "payment.status": { $in: ["pending", "failed"] },
        },
        {
          $set: {
            "payment.status": "completed",
            "payment.collectedMethod": "cash",
            "payment.collectedBy": req.user._id,
            "payment.collectedAt": now,
            "payment.paidAt": now,
          },
          $push: {
            statusHistory: {
              status: order.status,
              note: `Cash payment of ₹${order.pricing.total} received by delivery partner ${req.user.firstName} ${req.user.lastName}`,
            },
          },
        },
        { new: true },
      );

      if (!updated) {
        return fail(res, 409, "Payment was already updated. Please refresh.");
      }

      await notifyCustomerOfPayment(updated);

      res.json({
        success: true,
        message: "Cash payment recorded",
        data: serializeForPartner(updated, req.user._id),
      });
    } catch (error) {
      console.error("Delivery collect cash error:", error);
      fail(res, 500, "Failed to record payment");
    }
  }

  /**
   * Payment request for UPI: returns a standard `upi://pay` link for the
   * order's exact total, addressed to the configured UPI ID. The app renders
   * it as a QR; scanning it in any UPI app pre-fills payee and amount.
   * Nothing is marked paid here — see confirmUpiPayment.
   * @route POST /api/delivery-partner/orders/:id/payment/upi-qr
   */
  async createUpiQr(req, res) {
    try {
      const order = await loadAssignedOrder(req, res);
      if (!order) return;

      if (!ACTIVE_STATUSES.includes(order.status)) {
        return fail(res, 400, `Order is ${order.status}; payment can't be requested`);
      }
      if (order.payment?.status === "completed") {
        return fail(res, 409, "Payment has already been received for this order");
      }

      const upiId = (process.env.UPI_ID || "").trim();
      if (!upiId) {
        return fail(res, 503, "UPI payments are not available: no UPI ID is configured");
      }

      const amount = Number(order.pricing.total);
      if (!Number.isFinite(amount) || amount <= 0) {
        return fail(res, 400, "This order has no payable amount");
      }

      const payeeName = (process.env.UPI_PAYEE_NAME || "Green Basket").trim();
      // encodeURIComponent, but keep "@" readable as UPI apps expect
      const enc = (v) => encodeURIComponent(v).replace(/%40/g, "@");
      const amountText = amount.toFixed(2);
      const upiLink =
        `upi://pay?pa=${enc(upiId)}&pn=${enc(payeeName)}` +
        `&am=${amountText}&cu=INR&tn=${enc(`Order ${order.orderNumber}`)}`;

      res.json({
        success: true,
        data: { upiLink, upiId, payeeName, amount: Number(amountText) },
      });
    } catch (error) {
      console.error("Delivery create UPI QR error:", error);
      fail(res, 500, "Failed to generate UPI QR code");
    }
  }

  /**
   * The partner confirms a UPI payment arrived (checked in their own UPI app
   * / bank alert). A plain UPI QR has no gateway callback, so this explicit,
   * recorded confirmation is what marks the order paid.
   * @route POST /api/delivery-partner/orders/:id/payment/upi-confirm
   */
  async confirmUpiPayment(req, res) {
    try {
      const order = await loadAssignedOrder(req, res);
      if (!order) return;

      if (!ACTIVE_STATUSES.includes(order.status)) {
        return fail(res, 400, `Order is ${order.status}; payment can't be recorded`);
      }
      if (order.payment?.status === "completed") {
        return fail(res, 409, "Payment has already been received for this order");
      }

      const reference = String(req.body.reference || "").trim().slice(0, 40);
      const now = new Date();
      const updated = await Order.findOneAndUpdate(
        {
          _id: order._id,
          deliveryPartner: req.user._id,
          "payment.status": { $in: ["pending", "failed"] },
        },
        {
          $set: {
            "payment.status": "completed",
            "payment.collectedMethod": "upi",
            "payment.collectedBy": req.user._id,
            "payment.collectedAt": now,
            "payment.paidAt": now,
            ...(reference ? { "payment.transactionId": reference } : {}),
          },
          $push: {
            statusHistory: {
              status: order.status,
              note: `UPI payment of ₹${order.pricing.total} confirmed by delivery partner ${req.user.firstName} ${req.user.lastName}${reference ? ` (ref: ${reference})` : ""}`,
            },
          },
        },
        { new: true },
      );

      if (!updated) {
        return fail(res, 409, "Payment was already updated. Please refresh.");
      }

      await notifyCustomerOfPayment(updated);

      res.json({
        success: true,
        message: "UPI payment recorded",
        data: serializeForPartner(updated, req.user._id),
      });
    } catch (error) {
      console.error("Delivery confirm UPI error:", error);
      fail(res, 500, "Failed to record payment");
    }
  }

  /**
   * Assign (or unassign) an order's delivery partner
   * @route PUT /api/orders/:id/assign-delivery-partner
   * @access Admin
   */
  async assignPartner(req, res) {
    try {
      const { deliveryPartnerId } = req.body;
      const order = await Order.findById(req.params.id);
      if (!order) return fail(res, 404, "Order not found");

      if (["delivered", "cancelled", "refunded"].includes(order.status)) {
        return fail(res, 400, `Order is ${order.status}; it can't be reassigned`);
      }

      if (deliveryPartnerId) {
        const partner = await User.findOne({
          _id: deliveryPartnerId,
          role: "delivery_partner",
          isActive: true,
          approvalStatus: "approved",
        });
        if (!partner) {
          return fail(res, 400, "Not an active, approved delivery partner");
        }
        order.deliveryPartner = partner._id;
        order.deliveryPartnerAssignedAt = new Date();
      } else {
        order.deliveryPartner = undefined;
        order.deliveryPartnerAssignedAt = undefined;
      }

      order.statusHistory.push({
        status: order.status,
        note: deliveryPartnerId
          ? "Delivery partner assigned by admin"
          : "Delivery partner unassigned by admin",
      });
      await order.save();

      res.json({ success: true, message: "Delivery partner updated", data: order });
    } catch (error) {
      console.error("Assign delivery partner error:", error);
      fail(res, 500, "Failed to assign delivery partner");
    }
  }
}

export default new DeliveryPartnerController();
