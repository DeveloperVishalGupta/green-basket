import express from "express";
import notificationController from "../controllers/notificationController.js";
import { authenticate, isAuthorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * Notification Routes
 * All routes require authentication
 */

// Get user notifications
router.get("/", authenticate, notificationController.getNotifications);

// Get unread count
router.get(
  "/unread-count",
  authenticate,
  notificationController.getUnreadCount,
);

// Mark notification as read
router.put("/:id/read", authenticate, notificationController.markAsRead);

// Mark all as read
router.put("/read-all", authenticate, notificationController.markAllAsRead);

// Delete notification
router.delete("/:id", authenticate, notificationController.deleteNotification);

// Delete all notifications
router.delete(
  "/all",
  authenticate,
  notificationController.deleteAllNotifications,
);

// Create notification (admin only)
router.post(
  "/",
  authenticate,
  isAuthorize("admin"),
  notificationController.createNotification,
);

export default router;
