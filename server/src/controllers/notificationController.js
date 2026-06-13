import Notification from '../models/Notification.js';

/**
 * Notification Controller
 * Handles all notification-related operations
 */
class NotificationController {
  /**
   * Get user notifications with pagination
   * @route GET /api/notifications
   * @access Private
   */
  async getNotifications(req, res) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      const userId = req.user.id;

      const query = { user: userId };
      if (unreadOnly === 'true') {
        query.isRead = false;
      }

      const skip = (page - 1) * limit;

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query)
          .populate('order', 'orderNumber status totalAmount')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Notification.countDocuments(query),
        Notification.getUnreadCount(userId),
      ]);

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
        unreadCount,
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message,
      });
    }
  }

  /**
   * Get unread notification count
   * @route GET /api/notifications/unread-count
   * @access Private
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await Notification.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count',
        error: error.message,
      });
    }
  }

  /**
   * Mark notification as read
   * @route PUT /api/notifications/:id/read
   * @access Private
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOne({ _id: id, user: userId });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      await notification.markAsRead();

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message,
      });
    }
  }

  /**
   * Mark all notifications as read
   * @route PUT /api/notifications/read-all
   * @access Private
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message,
      });
    }
  }

  /**
   * Delete notification
   * @route DELETE /api/notifications/:id
   * @access Private
   */
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOneAndDelete({ _id: id, user: userId });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message,
      });
    }
  }

  /**
   * Delete all notifications
   * @route DELETE /api/notifications/all
   * @access Private
   */
  async deleteAllNotifications(req, res) {
    try {
      const userId = req.user.id;

      await Notification.deleteMany({ user: userId });

      res.json({
        success: true,
        message: 'All notifications deleted',
      });
    } catch (error) {
      console.error('Delete all notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete all notifications',
        error: error.message,
      });
    }
  }

  /**
   * Create notification (for testing or admin use)
   * @route POST /api/notifications
   * @access Private (Admin)
   */
  async createNotification(req, res) {
    try {
      const { userId, type, title, message, orderId, data } = req.body;

      const notification = await Notification.createNotification(userId, {
        type,
        title,
        message,
        order: orderId,
        data,
      });

      res.status(201).json({
        success: true,
        message: 'Notification created',
        data: notification,
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: error.message,
      });
    }
  }
}

export default new NotificationController();
