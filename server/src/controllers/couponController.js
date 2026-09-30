import Coupon from '../models/Coupon.js';

/**
 * Coupon Controller
 * Currently coupons are only ever issued automatically as loyalty rewards
 * (see services/loyaltyService.js) — there's no admin coupon-creation UI.
 */
class CouponController {
  /**
   * Get the current user's coupons (unused first, most recent first).
   * @route GET /api/coupons/my
   * @access Private
   */
  async getMyCoupons(req, res) {
    try {
      const coupons = await Coupon.find({ user: req.user._id }).sort({
        isUsed: 1,
        createdAt: -1,
      });

      res.json({
        success: true,
        data: coupons,
      });
    } catch (error) {
      console.error('Get my coupons error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch coupons',
        error: error.message,
      });
    }
  }
}

export default new CouponController();
