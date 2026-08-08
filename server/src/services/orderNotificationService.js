import whatsappClient from "../config/whatsapp.js";
import Order from "../models/Order.js";
import {
  buildCustomerOrderConfirmationTemplate,
  buildCustomerOrderStatusTemplate,
  buildVendorOrderNotificationTemplate,
} from "../utils/whatsappTemplates.js";

/**
 * Order Notification Service
 *
 * Centralizes post-checkout order notifications. Currently sends WhatsApp
 * messages to the customer and the vendor/admin, but any future channel
 * (SMS, push, etc.) can be added here without touching order/payment logic.
 *
 * Callers only need order + user data they already have in hand — no
 * extra lookups are made. Every method resolves rather than throws, so
 * calling this service can never fail a checkout request.
 *
 * Messages are sent as approved WhatsApp templates (not free-form text):
 * a customer/vendor who hasn't messaged the business number in the last
 * 24 hours can only be reached via a template Meta has pre-approved.
 */
class OrderNotificationService {
  get adminWhatsAppNumber() {
    // Falls back to the same admin number already used for OTP alerts.
    return process.env.ADMIN_WHATSAPP_NUMBER || "919320206598";
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
   * Sends the order-confirmation WhatsApp template to the customer.
   */
  async notifyCustomer(order, user) {
    try {
      const canSend = await this.claimNotificationSlot(order._id, "customer");
      if (!canSend) return;

      const phone = user?.phone || order.shippingAddress?.phone;
      const template = buildCustomerOrderConfirmationTemplate(order, user);
      const result = await whatsappClient.sendTemplateMessage(phone, template);

      if (result.success) {
        console.log(
          `✅ WhatsApp order confirmation sent to customer for order ${order.orderNumber}`,
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
   * Sends the new-order alert WhatsApp template (with Confirm/Reject
   * quick-reply buttons) to the vendor/admin, and records the resulting
   * message id so the webhook handler can correlate a button tap back to
   * this specific prompt.
   */
  async notifyVendor(order, user) {
    try {
      const canSend = await this.claimNotificationSlot(order._id, "vendor");
      if (!canSend) return;

      const template = buildVendorOrderNotificationTemplate(order);
      const result = await whatsappClient.sendTemplateMessage(
        this.adminWhatsAppNumber,
        template,
      );

      if (result.success) {
        await Order.findByIdAndUpdate(order._id, {
          $set: { "vendorWhatsapp.messageId": result.messageId },
        });
        console.log(
          `✅ WhatsApp new-order alert sent to vendor/admin for order ${order.orderNumber}`,
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

    await Promise.all([this.notifyCustomer(order, user), this.notifyVendor(order, user)]);
  }

  /**
   * Tells the customer whether the vendor confirmed or rejected their
   * order. Called from the WhatsApp webhook once a button tap has been
   * applied to the order — not idempotency-guarded itself since the
   * webhook only ever calls this once per order (see WhatsappEvent).
   */
  async notifyCustomerOfVendorDecision(order, user, vendorStatus) {
    try {
      const phone = user?.phone || order.shippingAddress?.phone;
      const template = buildCustomerOrderStatusTemplate(order, user, vendorStatus);
      const result = await whatsappClient.sendTemplateMessage(phone, template);

      if (result.success) {
        console.log(
          `✅ WhatsApp vendor-decision (${vendorStatus}) sent to customer for order ${order.orderNumber}`,
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
}

export default new OrderNotificationService();
