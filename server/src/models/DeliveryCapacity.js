import mongoose from "mongoose";

/**
 * DeliveryCapacity Schema
 * Tracks how many orders have been booked against a given delivery date,
 * so "Today"/"Tomorrow" can be marked unavailable once a date fills up.
 */
const deliveryCapacitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    maxOrders: {
      type: Number,
      default: 300,
    },
    bookedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("DeliveryCapacity", deliveryCapacitySchema);
