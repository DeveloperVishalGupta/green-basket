import express from 'express';
import wishlistController from '../controllers/wishlistController.js';
import { authenticate, isAuthorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Wishlist Routes
 * All routes require authentication
 */

// Get user's wishlist
router.get('/', authenticate, wishlistController.getWishlist);

// Check if product is in wishlist
router.get('/check/:productId', authenticate, wishlistController.checkWishlist);

// Add product to wishlist
router.post('/:productId', authenticate, wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/:productId', authenticate, wishlistController.removeFromWishlist);

// Cleanup expired items (admin only)
router.post('/cleanup', authenticate, isAuthorize('admin'), wishlistController.cleanupExpired);

export default router;
