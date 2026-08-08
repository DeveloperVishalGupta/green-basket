import crypto from "crypto";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import Order from "../models/Order.js";
import WhatsappEvent from "../models/WhatsappEvent.js";
import orderNotificationService from "../services/orderNotificationService.js";

/**
 * WhatsApp Webhook Controller
 *
 * Closes the loop opened by orderNotificationService#notifyVendor: the
 * vendor taps Confirm/Reject on the new-order WhatsApp prompt, Meta posts
 * that button tap here, and this applies it to the order + tells the
 * customer the outcome.
 */
class WhatsappController {
  /**
   * GET /api/webhooks/whatsapp — one-time verification handshake Meta
   * performs when the webhook URL is registered in App Dashboard.
   */
  verifyWebhook(req, res) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  }

  /**
   * Verifies the X-Hub-Signature-256 header Meta signs every webhook
   * delivery with, using the Meta App's secret (not the access token).
   * Skipped (allowed through) when WHATSAPP_APP_SECRET isn't set, so local
   * testing with ngrok works before that's configured.
   */
  isValidSignature(req) {
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret) return true;

    const signatureHeader = req.get("x-hub-signature-256");
    if (!signatureHeader || !req.rawBody) return false;

    const expected =
      "sha256=" +
      crypto.createHmac("sha256", appSecret).update(req.rawBody).digest("hex");

    const provided = Buffer.from(signatureHeader);
    const expectedBuf = Buffer.from(expected);

    return (
      provided.length === expectedBuf.length &&
      crypto.timingSafeEqual(provided, expectedBuf)
    );
  }

  /**
   * POST /api/webhooks/whatsapp — receives message events, including
   * vendor button taps on the new-order prompt.
   */
  async receiveWebhook(req, res) {
    // Acknowledge immediately — Meta retries deliveries that don't get a
    // fast 200, and processing below shouldn't block/fail that ack.
    res.sendStatus(200);

    if (!this.isValidSignature(req)) {
      console.warn("⚠️ WhatsApp webhook signature verification failed");
      return;
    }

    try {
      const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message || message.type !== "button") return;

      await this.handleVendorButtonReply(message);
    } catch (error) {
      console.error("❌ Failed to process WhatsApp webhook:", error.message);
    }
  }

  async handleVendorButtonReply(message) {
    // First insert wins: a redelivered/duplicated event fails the unique
    // index on messageId and is skipped rather than re-applied.
    try {
      await WhatsappEvent.create({
        messageId: message.id,
        eventType: "button_reply",
        payload: message.button,
      });
    } catch (error) {
      if (error.code === 11000) return; // already processed this delivery
      throw error;
    }

    const payload = message.button?.payload || "";
    const separatorIndex = payload.indexOf("_");
    if (separatorIndex === -1) return;

    const action = payload.slice(0, separatorIndex);
    const orderId = payload.slice(separatorIndex + 1);

    if (!["CONFIRM", "REJECT"].includes(action)) return;
    if (!mongoose.Types.ObjectId.isValid(orderId)) return;

    const vendorStatus = action === "CONFIRM" ? "confirmed" : "rejected";
    const orderStatus = action === "CONFIRM" ? "confirmed" : "cancelled";
    const note =
      action === "CONFIRM"
        ? "Confirmed by vendor via WhatsApp"
        : "Rejected by vendor via WhatsApp";
    const now = new Date();

    const update = {
      $set: {
        status: orderStatus,
        "vendorWhatsapp.status": vendorStatus,
        "vendorWhatsapp.respondedAt": now,
      },
      $push: { statusHistory: { status: orderStatus, note, updatedAt: now } },
    };

    if (action === "REJECT") {
      update.$set.cancelledAt = now;
      update.$set.cancelledBy = "admin";
      update.$set.cancellationReason = note;
    }

    // Only ever transitions an order out of "pending" — a vendor tapping a
    // stale/already-answered prompt a second time is a no-op, not a flip.
    const order = await Order.findOneAndUpdate(
      { _id: orderId, "vendorWhatsapp.status": "pending" },
      update,
      { new: true },
    );

    if (!order) return;

    await WhatsappEvent.updateOne({ messageId: message.id }, { order: order._id });

    await Promise.all([
      orderNotificationService.notifyCustomerOfVendorDecision(
        order,
        order.user,
        vendorStatus,
      ),
      Notification.createNotification(order.user._id || order.user, {
        type: vendorStatus === "confirmed" ? "order_confirmed" : "order_cancelled",
        title: vendorStatus === "confirmed" ? "Order Confirmed" : "Order Rejected",
        message:
          vendorStatus === "confirmed"
            ? `Your order #${order.orderNumber} has been confirmed by the vendor.`
            : `Your order #${order.orderNumber} was rejected by the vendor.`,
        order: order._id,
        data: { orderNumber: order.orderNumber, status: orderStatus },
      }),
    ]);
  }
}

export default new WhatsappController();
