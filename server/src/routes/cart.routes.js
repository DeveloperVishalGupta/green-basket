import express from 'express';
import { body } from 'express-validator';
import cartController from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
const router = express.Router();

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', authenticate, cartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private
 */
router.post(
  '/items',
  authenticate,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('size').optional(),
    body('color').optional(),
    validate,
  ],
  cartController.addItem
);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put(
  '/items/:itemId',
  authenticate,
  [
    body('quantity')
      .isInt({ min: 0 })
      .withMessage('Quantity must be 0 or greater'),
    validate,
  ],
  cartController.updateItemQuantity
);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/items/:itemId', authenticate, cartController.removeItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private
 */
router.delete('/', authenticate, cartController.clearCart);

export default router;
