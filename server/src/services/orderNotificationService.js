import Notification from "../models/Notification.js";
import Order from "../models/Order.js";
import messagingService, {
  sendWhatsAppMessage,
} from "./messaging/messagingService.js";
import {
  buildCustomerOrderDetailsText,
  buildVendorOrderDetailsText,
} from "../utils/whatsappTemplates.js";

const ISSUE_LABELS = {
  unavailable: "is no longer available",
  partial_stock: "only has limited stock left",
  price_change: "now has a different price",
};

/**
 * Order Notification Service
 *
 * Centralizes post-checkout order notifications. It builds the customer /
 * vendor WhatsApp messages and hands them to ./messaging/messagingService,
 * which decides *how* they actually go out (a wa.me click-to-chat link
 * today; the WhatsApp Cloud API later — just flip MESSAGING_PROVIDER).
 *
 * Callers only need order + user data they already have in hand — no
 * extra lookups are made. Every method resolves rather than throws, so
 * calling this service can never fail a checkout request.
 */
class OrderNotificationService {
  get adminWhatsAppNumber() {
    return messagingService.getSenderNumber();
  }

  /**
   * Atomically flips whatsappNotified.<recipient> from false to true.
   * Resolves true only for the caller that "wins" the flip, guaranteeing
   * a given recipient is notified at most once per order — even if
   * payment verification and the Razorpay webhook both fire for it.
   */
  async claimNotificationSlot(orderId, recipient) {
    try {
      const claimed = await Order.findOneAndUpdate(
        { _id: orderId, [`whatsappNotified.${recipient}`]: { $ne: true } },
        { $set: { [`whatsappNotified.${recipient}`]: true } },
      );

      return Boolean(claimed);
    } catch (error) {
      console.error(
        `❌ Failed to claim WhatsApp notification slot (${recipient}):`,
        error.message,
      );
      return false;
    }
  }

  /**
   * Builds the full order summary (itemised list, bill breakdown with any
   * offer/coupon discount, delivery date + allotted time slot) and sends
   * it to the customer from the store's sender number via the active
   * messaging provider.
   */
  async notifyCustomer(order, user) {
    try {
      const canSend = await this.claimNotificationSlot(order._id, "customer");
      if (!canSend) return;

      const phone = user?.phone || order.shippingAddress?.phone;
      const body = buildCustomerOrderDetailsText(order, user);

      const result = await sendWhatsAppMessage({ to: phone, body });

      if (result.success) {
        const customerWhatsapp = {
          provider: result.provider,
          link: result.link,
          messageId: result.messageId,
          sentAt: new Date(),
        };
        // Persist, and reflect it on the in-memory order so the
        // order-creation response can carry the link straight away.
        order.customerWhatsapp = customerWhatsapp;
        await Order.findByIdAndUpdate(order._id, { $set: { customerWhatsapp } });
        console.log(
          `✅ WhatsApp order confirmation prepared for customer (order ${order.orderNumber}, provider ${result.provider})`,
        );
      } else {
        console.warn(
          `⚠️ WhatsApp order confirmation to customer failed for order ${order.orderNumber}: ${result.error}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to notify customer via WhatsApp for order ${order.orderNumber}:`,
        error.message,
      );
    }
  }

  /**
   * Sends a compact new-order alert to the vendor/admin number.
   */
  async notifyVendor(order) {
    try {
      const canSend = await this.claimNotificationSlot(order._id, "vendor");
      if (!canSend) return;

      const body = buildVendorOrderDetailsText(order);
      const result = await sendWhatsAppMessage({
        to: this.adminWhatsAppNumber,
        body,
      });

      if (result.success) {
        await Order.findByIdAndUpdate(order._id, {
          $set: {
            "vendorWhatsapp.messageId": result.messageId,
            "vendorWhatsapp.link": result.link,
          },
        });
        console.log(
          `✅ WhatsApp new-order alert prepared for vendor/admin (order ${order.orderNumber}, provider ${result.provider})`,
        );
      } else {
        console.warn(
          `⚠️ WhatsApp new-order alert to vendor/admin failed for order ${order.orderNumber}: ${result.error}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to notify vendor via WhatsApp for order ${order.orderNumber}:`,
        error.message,
      );
    }
  }

  /**
   * Fires both the customer confirmation and vendor/admin alert for an
   * order. Safe to call from multiple places (order creation, payment
   * verification, payment webhook) — the idempotency guard above ensures
   * each recipient only ever receives one message per order.
   */
  async sendOrderWhatsAppNotifications(order, user) {
    if (!order) return;

    await Promise.all([
      this.notifyCustomer(order, user),
      this.notifyVendor(order),
    ]);
  }

  /**
   * Tells the customer whether the vendor confirmed or rejected their
   * order. Called from the WhatsApp webhook once a button tap has been
   * applied to the order.
   */
  async notifyCustomerOfVendorDecision(order, user, vendorStatus) {
    try {
      const phone = user?.phone || order.shippingAddress?.phone;
      const name =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "there";
      const body =
        vendorStatus === "confirmed"
          ? `Hi ${name}, good news! Your Green Basket order ${order.orderNumber} has been confirmed and is being prepared for delivery.`
          : `Hi ${name}, we're sorry — your Green Basket order ${order.orderNumber} could not be accepted. Any amount paid will be refunded. Please contact us for help.`;

      const result = await sendWhatsAppMessage({ to: phone, body });

      if (result.success) {
        console.log(
          `✅ WhatsApp vendor-decision (${vendorStatus}) prepared for customer (order ${order.orderNumber})`,
        );
      } else {
        console.warn(
          `⚠️ WhatsApp vendor-decision (${vendorStatus}) to customer failed for order ${order.orderNumber}: ${result.error}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to notify customer of vendor decision for order ${order.orderNumber}:`,
        error.message,
      );
    }
  }

  /**
   * Tells the customer that the delivery-day (or admin-triggered)
   * availability check found one or more items with a stock/price issue,
   * and that a decision is needed before the order can be delivered.
   * Fires a WhatsApp message plus an in-app notification; never throws.
   */
  async notifyCustomerOfAvailabilityIssues(order, user, issues) {
    try {
      if (!issues?.length) return;

      const phone = user?.phone || order.shippingAddress?.phone;
      const name =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        "there";
      const lines = issues
        .map(
          (issue) =>
            `• ${issue.name} (${issue.variant}) ${ISSUE_LABELS[issue.issueType] || "has an issue"}`,
        )
        .join("\n");

      const body =
        `Hi ${name}, before we prepare your Green Basket order ${order.orderNumber} ` +
        `for delivery, a couple of items need your attention:\n\n${lines}\n\n` +
        `Please open the order in the app to replace, remove, or confirm these items.`;

      const result = await sendWhatsAppMessage({ to: phone, body });
      if (!result.success) {
        console.warn(
          `⚠️ WhatsApp availability-issue alert to customer failed for order ${order.orderNumber}: ${result.error}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to notify customer of availability issues for order ${order.orderNumber}:`,
        error.message,
      );
    }

    try {
      await Notification.createNotification(order.user, {
        type: "order_action_required",
        title: "Action needed on your order",
        message: `Some items in order #${order.orderNumber} need your attention before delivery — please review and choose how to proceed.`,
        order: order._id,
        data: {
          orderNumber: order.orderNumber,
          issues: issues.map((issue) => ({
            itemId: issue.itemId,
            name: issue.name,
            issueType: issue.issueType,
          })),
        },
      });
    } catch (error) {
      console.error(
        `❌ Failed to create action-required notification for order ${order.orderNumber}:`,
        error.message,
      );
    }
  }

  /**
   * Tells the customer their order's final amount/items changed from what
   * they originally placed — sent once per order, right after a
   * resolution actually moves the total (see Order.fulfillment.
   * customerNotifiedOfChangeAt), so they see it before delivery.
   */
  async notifyCustomerOfOrderUpdate(order, user) {
    try {
      const phone = user?.phone || order.shippingAddress?.phone;
      const name =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        "there";
      const original = order.fulfillment?.originalTotal;
      const body =
        `Hi ${name}, your Green Basket order ${order.orderNumber} has been updated ` +
        `based on your choices for the unavailable/price-changed items. ` +
        (original != null
          ? `New total: ₹${order.pricing.total} (was ₹${original}). `
          : "") +
        `You'll pay the updated amount on delivery.`;

      const result = await sendWhatsAppMessage({ to: phone, body });
      if (!result.success) {
        console.warn(
          `⚠️ WhatsApp order-update alert to customer failed for order ${order.orderNumber}: ${result.error}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to notify customer of order update for order ${order.orderNumber}:`,
        error.message,
      );
    }

    try {
      await Notification.createNotification(order.user, {
        type: "order_updated",
        title: "Your order was updated",
        message: `Order #${order.orderNumber}'s final amount is now ₹${order.pricing.total}, based on the choices you made for unavailable/price-changed items.`,
        order: order._id,
        data: {
          orderNumber: order.orderNumber,
          total: order.pricing.total,
          originalTotal: order.fulfillment?.originalTotal,
        },
      });
    } catch (error) {
      console.error(
        `❌ Failed to create order-updated notification for order ${order.orderNumber}:`,
        error.message,
      );
    }
  }
}

export default new OrderNotificationService();
