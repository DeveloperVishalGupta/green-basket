import Wishlist from '../models/Wishlist.js';

/**
 * Wishlist Controller
 * Handles all wishlist-related requests
 */
class WishlistController {
  /**
   * Get user's wishlist
   * @route GET /api/wishlist
   * @access Private
   */
  async getWishlist(req, res) {
    try {
      const wishlist = await Wishlist.getUserWishlist(req.user.id);

      res.json({
        success: true,
        data: wishlist,
        count: wishlist.length,
      });
    } catch (error) {
      console.error('Get wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch wishlist',
        error: error.message,
      });
    }
  }

  /**
   * Add product to wishlist
   * @route POST /api/wishlist/:productId
   * @access Private
   */
  async addToWishlist(req, res) {
    try {
      const { productId } = req.params;

      const wishlistItem = await Wishlist.addToWishlist(req.user.id, productId);

      res.json({
        success: true,
        data: wishlistItem,
        message: 'Product added to wishlist (expires in 7 days)',
      });
    } catch (error) {
      console.error('Add to wishlist error:', error);
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add to wishlist',
        error: error.message,
      });
    }
  }

  /**
   * Remove product from wishlist
   * @route DELETE /api/wishlist/:productId
   * @access Private
   */
  async removeFromWishlist(req, res) {
    try {
      const { productId } = req.params;

      await Wishlist.removeFromWishlist(req.user.id, productId);

      res.json({
        success: true,
        message: 'Product removed from wishlist',
      });
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove from wishlist',
        error: error.message,
      });
    }
  }

  /**
   * Check if product is in wishlist
   * @route GET /api/wishlist/check/:productId
   * @access Private
   */
  async checkWishlist(req, res) {
    try {
      const { productId } = req.params;

      const isInWishlist = await Wishlist.isInWishlist(req.user.id, productId);

      res.json({
        success: true,
        data: {
          isInWishlist,
          productId,
        },
      });
    } catch (error) {
      console.error('Check wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check wishlist',
        error: error.message,
      });
    }
  }

  /**
   * Clear expired wishlist items (manual cleanup)
   * @route POST /api/wishlist/cleanup
   * @access Private (Admin only)
   */
  async cleanupExpired(req, res) {
    try {
      const result = await Wishlist.cleanupExpired();

      res.json({
        success: true,
        message: 'Expired wishlist items cleaned up',
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error('Cleanup wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup wishlist',
        error: error.message,
      });
    }
  }
}

export default new WishlistController();
