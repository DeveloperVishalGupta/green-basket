import mongoose from "mongoose";

/**
 * Log of inbound WhatsApp webhook deliveries (button taps, status
 * callbacks). Meta retries webhook deliveries that don't get a fast 200,
 * and can redeliver the same event more than once regardless — the unique
 * index on messageId is what makes processing a given delivery idempotent:
 * the first insert wins, later duplicates fail with E11000 and are skipped.
 */
const whatsappEventSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    eventType: String,
    payload: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("WhatsappEvent", whatsappEventSchema);
