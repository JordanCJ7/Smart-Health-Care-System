import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Get user's notifications
// @route   GET /api/notifications/me
// @access  Private
export const getMyNotifications = asyncHandler(async (req, res) => {
  const { status, type } = req.query;

  const query = { recipientId: req.user.id };
  if (status) query.status = status;
  if (type) query.type = type;

  const notifications = await Notification.find(query)
    .populate('senderId', 'name role')
    .populate('relatedPrescriptionId', 'medications status')
    .sort('-createdAt');

  sendSuccess(res, notifications);
});

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
    .populate('senderId', 'name role')
    .populate('relatedPrescriptionId')
    .populate('relatedPaymentId');

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check authorization
  if (notification.recipientId.toString() !== req.user.id && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized to view this notification');
  }

  sendSuccess(res, notification);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check authorization
  if (notification.recipientId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this notification');
  }

  await notification.markAsRead();

  sendSuccess(res, notification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.user.id, status: 'Unread' },
    { status: 'Read', readAt: new Date() }
  );

  sendSuccess(res, { message: 'All notifications marked as read' });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check authorization
  if (notification.recipientId.toString() !== req.user.id && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }

  await notification.deleteOne();

  sendSuccess(res, { message: 'Notification deleted' });
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipientId: req.user.id,
    status: 'Unread',
  });

  sendSuccess(res, { count });
});
