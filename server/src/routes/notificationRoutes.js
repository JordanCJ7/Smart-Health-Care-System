import express from 'express';
import {
  getMyNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.put('/read-all', markAllNotificationsAsRead);

// Get user's notifications
router.get('/me', getMyNotifications);

// Mark notification as read
router.put('/:id/read', markNotificationAsRead);

// Get, delete specific notification
router
  .route('/:id')
  .get(getNotificationById)
  .delete(deleteNotification);

export default router;
