import mongoose from 'mongoose';

/**
 * Cart Schema
 * Handles shopping cart for users
 */
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
          default: 1,
        },
        size: String,
        color: String,
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
// Note: user index is created automatically by unique: true

/**
 * Virtual for total items in cart
 */
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

/**
 * Virtual for subtotal
 */
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
});

/**
 * Populate product details
 */
cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'items.product',
    select: 'name slug images price stock isActive',
  });
  next();
});

/**
 * Method to add item to cart
 * @param {Object} item - Item to add { product, quantity, size, color, price }
 */
cartSchema.methods.addItem = function (item) {
  const existingItemIndex = this.items.findIndex(
    (i) => 
      i.product.toString() === item.product.toString() &&
      i.size === item.size &&
      i.color === item.color
  );

  if (existingItemIndex > -1) {
    this.items[existingItemIndex].quantity += item.quantity;
  } else {
    this.items.push(item);
  }

  return this.save();
};

/**
 * Method to update item quantity
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 */
cartSchema.methods.updateQuantity = function (itemId, quantity) {
  const item = this.items.id(itemId);
  
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    this.items.pull(itemId);
  } else {
    item.quantity = quantity;
  }

  return this.save();
};

/**
 * Method to remove item from cart
 * @param {string} itemId - Cart item ID
 */
cartSchema.methods.removeItem = function (itemId) {
  this.items.pull(itemId);
  return this.save();
};

/**
 * Method to clear cart
 */
cartSchema.methods.clearCart = function () {
  this.items = [];
  return this.save();
};

export default mongoose.model('Cart', cartSchema);
