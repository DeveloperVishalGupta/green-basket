import Notification from "../models/Notification.js";
import User from "../models/User.js";
import loyaltyService from "./loyaltyService.js";

/**
 * Order Status Service
 * Shared by every actor that moves an order through its lifecycle (admin,
 * delivery partner) so the customer notification, loyalty reward and
 * payment-before-delivery rules live in exactly one place. The order and
 * payment status fields on the Order document remain the single source of
 * truth — every dashboard reads them from the same API.
 */

/** Notification types that have a dedicated enum value in Notification.js */
const DEDICATED_NOTIFICATION_TYPES = [
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

/**
 * Status transitions each non-admin role may perform (admins keep their
 * existing, unrestricted status endpoint).
 */
export const ROLE_STATUS_TRANSITIONS = {
  delivery_partner: {
    processing: ["shipped"],
    shipped: ["delivered"],
  },
};

/**
 * @returns {boolean} whether `role` may move an order from `from` to `to`
 */
export const isTransitionAllowed = (role, from, to) =>
  !!ROLE_STATUS_TRANSITIONS[role]?.[from]?.includes(to);

/**
 * An order may only be delivered once its payment is settled.
 * @returns {{ ok: boolean, message?: string }}
 */
export const checkDeliverable = (order) => {
  if (order.payment?.status === "completed") return { ok: true };
  return {
    ok: false,
    message:
      "Payment has not been received yet. Collect the payment (cash or UPI) before marking the order as delivered.",
  };
};

const notificationCopy = (order, status) =>
  ({
    pending: {
      title: "Order Pending",
      message: `Your order #${order.orderNumber} is pending confirmation.`,
    },
    confirmed: {
      title: "Order Confirmed",
      message: `Your order #${order.orderNumber} has been confirmed and is being processed.`,
    },
    processing: {
      title: "Order Processing",
      message: `Your order #${order.orderNumber} is being prepared for shipment.`,
    },
    shipped: {
      title: "Order Out for Delivery",
      message: `Your order #${order.orderNumber} has been shipped and is on its way.${
        order.trackingNumber ? ` Tracking number: ${order.trackingNumber}` : ""
      }`,
    },
    delivered: {
      title: "Order Delivered",
      message: `Your order #${order.orderNumber} has been delivered. Thank you for shopping with us!`,
    },
    cancelled: {
      title: "Order Cancelled",
      message: `Your order #${order.orderNumber} has been cancelled. ${order.cancellationReason || ""}`,
    },
    refunded: {
      title: "Order Refunded",
      message: `Your order #${order.orderNumber} has been refunded. The amount will be credited to your account.`,
    },
  })[status];

/**
 * Notify the customer about an order status change. Never throws.
 */
export const notifyCustomerOfStatus = async (order, status) => {
  try {
    const copy = notificationCopy(order, status);
    if (!copy) return;

    await Notification.createNotification(order.user?._id || order.user, {
      type: DEDICATED_NOTIFICATION_TYPES.includes(status)
        ? `order_${status}`
        : "order_status_update",
      title: copy.title,
      message: copy.message,
      order: order._id,
      data: {
        orderNumber: order.orderNumber,
        status,
        trackingNumber: order.trackingNumber,
      },
    });
  } catch (error) {
    console.error("❌ Failed to create notification:", error);
  }
};

/**
 * Notify the customer that their payment was recorded. Never throws.
 */
export const notifyCustomerOfPayment = async (order) => {
  try {
    await Notification.createNotification(order.user?._id || order.user, {
      type: "payment_received",
      title: "Payment Received",
      message: `We received your payment of ₹${order.pricing?.total} for order #${order.orderNumber}.`,
      order: order._id,
      data: {
        orderNumber: order.orderNumber,
        paymentStatus: order.payment?.status,
        paymentMethod: order.payment?.collectedMethod,
      },
    });
  } catch (error) {
    console.error("❌ Failed to create payment notification:", error);
  }
};

/**
 * Every 10th delivered order earns the customer a loyalty coupon.
 * Never throws.
 */
export const grantLoyaltyOnDelivery = async (order) => {
  try {
    const userId = order.user?._id || order.user;
    const user = await User.findById(userId);
    await loyaltyService.checkAndGrantMilestoneCoupon(userId, user);
  } catch (error) {
    console.error("❌ Failed to check/grant loyalty milestone coupon:", error);
  }
};
