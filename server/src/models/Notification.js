import mongoose from 'mongoose';

/**
 * Notification Schema
 * Tracks all user notifications (order updates, messages, etc.)
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'order_created',
        'order_confirmed',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'order_refunded',
        'order_status_update',
        'message',
        'promotion',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Reference to related order (if applicable)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    // Additional data (flexible for different notification types)
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Read status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    // When user read the notification
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

/**
 * Mark notification as read
 */
notificationSchema.methods.markAsRead = async function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

/**
 * Static method to create notification
 * @param {ObjectId} userId - User ID
 * @param {Object} notificationData - Notification data
 */
notificationSchema.statics.createNotification = async function (userId, notificationData) {
  return await this.create({
    user: userId,
    ...notificationData,
  });
};

/**
 * Static method to get unread count
 * @param {ObjectId} userId - User ID
 */
notificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({ user: userId, isRead: false });
};

export default mongoose.model('Notification', notificationSchema);
