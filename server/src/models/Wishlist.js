import mongoose from 'mongoose';

/**
 * Wishlist Schema
 * Stores user wishlist items with 7-day automatic expiry
 */
const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      index: { expires: 0 }, // TTL index - MongoDB will automatically delete expired documents
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate wishlist items for same user
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// Instance method to check if wishlist item is expired
wishlistSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

// Static method to get user's wishlist items (non-expired)
wishlistSchema.statics.getUserWishlist = async function (userId) {
  return this.find({
    user: userId,
    expiresAt: { $gt: new Date() },
  })
    .populate('product', 'name slug price images compareAtPrice stock')
    .sort({ createdAt: -1 });
};

// Static method to add item to wishlist
wishlistSchema.statics.addToWishlist = async function (userId, productId) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  return this.findOneAndUpdate(
    { user: userId, product: productId },
    { expiresAt }, // Reset expiry if already exists
    { 
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

// Static method to remove item from wishlist
wishlistSchema.statics.removeFromWishlist = async function (userId, productId) {
  return this.findOneAndDelete({
    user: userId,
    product: productId,
  });
};

// Static method to check if product is in user's wishlist
wishlistSchema.statics.isInWishlist = async function (userId, productId) {
  const item = await this.findOne({
    user: userId,
    product: productId,
    expiresAt: { $gt: new Date() },
  });
  return !!item;
};

// Static method to manually cleanup expired items (optional - MongoDB TTL does this automatically)
wishlistSchema.statics.cleanupExpired = async function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

export default mongoose.model('Wishlist', wishlistSchema);
