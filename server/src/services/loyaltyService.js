import crypto from 'crypto';
import { sendCouponUnlockedEmail } from '../config/email.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import Order from '../models/Order.js';

const MILESTONE_INTERVAL = 10;
const REWARD_VALUE = 50; // flat ₹ off
const COUPON_VALID_DAYS = 30;

/**
 * Called after an order transitions to "delivered". Every 10th delivered
 * order (10, 20, 30, ...) earns the customer a one-time discount coupon.
 * Safe to call repeatedly for the same order — milestone + user is unique,
 * so it never grants the same milestone twice.
 * @param {string} userId
 * @param {Object} [user] - Already-loaded user doc, to skip a lookup for
 *   the notification email; falls back to a fresh lookup if not given.
 */
async function checkAndGrantMilestoneCoupon(userId, user) {
  const deliveredCount = await Order.countDocuments({
    user: userId,
    status: 'delivered',
  });

  if (deliveredCount === 0 || deliveredCount % MILESTONE_INTERVAL !== 0) {
    return null;
  }

  const alreadyGranted = await Coupon.findOne({
    user: userId,
    milestone: deliveredCount,
  });
  if (alreadyGranted) return null;

  const code = `LOYAL${deliveredCount}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;

  const coupon = await Coupon.create({
    code,
    user: userId,
    discountType: 'flat',
    discountValue: REWARD_VALUE,
    reason: 'loyalty_milestone',
    milestone: deliveredCount,
    expiresAt: new Date(Date.now() + COUPON_VALID_DAYS * 24 * 60 * 60 * 1000),
  });

  try {
    await Notification.createNotification(userId, {
      type: 'coupon_unlocked',
      title: '🎉 You unlocked a reward!',
      message: `You've completed ${deliveredCount} orders! Use code ${code} for ₹${REWARD_VALUE} off your next order.`,
      data: {
        couponCode: code,
        discountValue: REWARD_VALUE,
        milestone: deliveredCount,
        expiresAt: coupon.expiresAt,
      },
    });
  } catch (notificationError) {
    console.error(
      '❌ Failed to create coupon-unlocked notification:',
      notificationError,
    );
  }

  try {
    if (user?.email) {
      await sendCouponUnlockedEmail(user, coupon);
    }
  } catch (emailError) {
    console.error('❌ Failed to send coupon-unlocked email:', emailError);
  }

  return coupon;
}

export default { checkAndGrantMilestoneCoupon };
