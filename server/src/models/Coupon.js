import mongoose from 'mongoose';

/**
 * Coupon Schema
 * Currently only issued automatically as a loyalty reward (see
 * services/loyaltyService.js) when a customer reaches an order-count
 * milestone. Each coupon belongs to exactly one user and can be redeemed
 * once, at checkout (see orderController.createOrder).
 */
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      default: 'flat',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    freeDelivery: {
      type: Boolean,
      default: false,
    },
    // Why this coupon exists — only one source today, kept as an enum so
    // future reward types (referral, birthday, etc.) have a clear slot.
    reason: {
      type: String,
      enum: ['loyalty_milestone'],
      default: 'loyalty_milestone',
    },
    // The delivered-order count that earned this coupon (10, 20, 30, ...).
    // Also used to guarantee a milestone is only ever rewarded once.
    milestone: {
      type: Number,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: Date,
    usedOnOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    expiresAt: Date,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Coupon', couponSchema);
