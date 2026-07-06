import express from 'express';
import { body } from 'express-validator';
import orderController from '../controllers/orderController.js';
import { authenticate, isAuthorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
const router = express.Router();

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (Admin only)
 * @access  Private (Admin)
 */
router.get(
  '/admin/all',
  authenticate,
  isAuthorize('admin'),
  orderController.getAllOrders
);

/**
 * @route   GET /api/orders/all
 * @desc    Get all orders (Admin only) - Alternative route
 * @access  Private (Admin)
 */
router.get(
  '/all',
  authenticate,
  isAuthorize('admin'),
  orderController.getAllOrders
);

/**
 * @route   GET /api/orders
 * @desc    Get all orders for current user
 * @access  Private
 */
router.get('/', authenticate, orderController.getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/:id', authenticate, orderController.getOrderById);

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    body('shippingAddress.street')
      .notEmpty().withMessage('Street is required')
      .isLength({ max: 185 }).withMessage('Delivery address cannot exceed 185 characters'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
    body('paymentMethod')
      .isIn(['card', 'upi', 'netbanking'])
      .withMessage('Invalid payment method'),
    body('pricing').notEmpty().withMessage('Pricing information is required'),
    body('pricing.subtotal').isNumeric().withMessage('Subtotal must be a number'),
    body('pricing.discount').optional().isNumeric().withMessage('Discount must be a number'),
    body('pricing.shippingFee').isNumeric().withMessage('Shipping fee must be a number'),
    body('pricing.total').isNumeric().withMessage('Total must be a number'),
    validate,
  ],
  orderController.createOrder
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin only)
 */
router.put(
  '/:id/status',
  authenticate,
  isAuthorize('admin'),
  [
    body('status')
      .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
      .withMessage('Invalid order status'),
    body('note').optional(),
    validate,
  ],
  orderController.updateOrderStatus
);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.post(
  '/:id/cancel',
  authenticate,
  [
    body('reason').optional().trim(),
    validate,
  ],
  orderController.cancelOrder
);

/**
 * @route   POST /api/orders/:id/refund/refresh
 * @desc    Refresh refund status from Razorpay
 * @access  Private
 */
router.post(
  '/:id/refund/refresh',
  authenticate,
  orderController.refreshRefundStatus
);

/**
 * @route   PUT /api/orders/:id/shipment
 * @desc    Update order with shipment information
 * @access  Private (Admin only)
 */
router.put(
  '/:id/shipment',
  authenticate,
  isAuthorize('admin'),
  [
    body('shipmentOrderId').optional(),
    body('shipmentId').optional(),
    body('awb').optional(),
    body('courier').optional(),
    validate,
  ],
  orderController.updateOrderShipment
);

export default router;
