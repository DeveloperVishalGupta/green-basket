import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
/**
 * Payment Routes
 * All routes require authentication except webhook
 */

// Create Razorpay order
router.post('/create-order', authenticate, paymentController.createOrder);

// Verify payment after transaction
router.post('/verify', authenticate, paymentController.verifyPayment);

// Razorpay webhook (no auth required - Razorpay signs the request)
router.post('/webhook', express.json(), paymentController.handleWebhook);

// Get available payment methods
router.get('/methods', paymentController.getPaymentMethods);

export default router;
