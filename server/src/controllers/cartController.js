import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * Cart Controller
 * Handles shopping cart operations
 */
class CartController {
  /**
   * Get user's cart
   * @route GET /api/cart
   * @access Private
   */
  async getCart(req, res) {
    try {
      let cart = await Cart.findOne({ user: req.user.id });

      if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
      }

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cart',
        error: error.message,
      });
    }
  }

  /**
   * Add item to cart
   * @route POST /api/cart/items
   * @access Private
   */
  async addItem(req, res) {
    try {
      const { productId, quantity = 1, size, color } = req.body;

      // Validate product
      const product = await Product.findById(productId);

      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or unavailable',
        });
      }

      // Check stock
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      // Get or create cart
      let cart = await Cart.findOne({ user: req.user.id });

      if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;

        if (product.stock < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} items available in stock`,
          });
        }

        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].price = product.price;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          size,
          color,
          price: product.price,
        });
      }

      await cart.save();
      await cart.populate('items.product');

      res.json({
        success: true,
        message: 'Item added to cart',
        data: cart,
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add item to cart',
        error: error.message,
      });
    }
  }

  /**
   * Update cart item quantity
   * @route PUT /api/cart/items/:itemId
   * @access Private
   */
  async updateItemQuantity(req, res) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity',
        });
      }

      const cart = await Cart.findOne({ user: req.user.id });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      const item = cart.items.id(itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found in cart',
        });
      }

      // Check stock
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      if (quantity === 0) {
        cart.items.pull(itemId);
      } else {
        item.quantity = quantity;
        item.price = product.price; // Update price in case it changed
      }

      await cart.save();
      await cart.populate('items.product');

      res.json({
        success: true,
        message: 'Cart updated successfully',
        data: cart,
      });
    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update cart',
        error: error.message,
      });
    }
  }

  /**
   * Remove item from cart
   * @route DELETE /api/cart/items/:itemId
   * @access Private
   */
  async removeItem(req, res) {
    try {
      const { itemId } = req.params;

      const cart = await Cart.findOne({ user: req.user.id });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      const item = cart.items.id(itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found in cart',
        });
      }

      cart.items.pull(itemId);
      await cart.save();
      await cart.populate('items.product');

      res.json({
        success: true,
        message: 'Item removed from cart',
        data: cart,
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove item from cart',
        error: error.message,
      });
    }
  }

  /**
   * Clear cart
   * @route DELETE /api/cart
   * @access Private
   */
  async clearCart(req, res) {
    try {
      const cart = await Cart.findOne({ user: req.user.id });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      cart.items = [];
      await cart.save();

      res.json({
        success: true,
        message: 'Cart cleared successfully',
        data: cart,
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart',
        error: error.message,
      });
    }
  }
}

export default new CartController();
