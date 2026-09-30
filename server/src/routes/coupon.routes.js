import express from 'express';
import couponController from '../controllers/couponController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/coupons/my
 * @desc    Get the current user's coupons (loyalty rewards)
 * @access  Private
 */
router.get('/my', authenticate, couponController.getMyCoupons);

export default router;
