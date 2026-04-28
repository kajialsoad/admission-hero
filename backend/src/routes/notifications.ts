import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Notification from '../models/Notification';
import { protect, adminOnly } from '../middlewares/auth';
import {
  sendNotification,
  getNotificationHistory,
  subscribeUserToTopic,
  unsubscribeUserFromTopic,
  updateFCMToken,
} from '../controllers/notificationController';

const router = express.Router();

// Firebase notification routes (admin only)
router.post('/send', protect, adminOnly, sendNotification);
router.get('/history', protect, adminOnly, getNotificationHistory);
router.post('/subscribe-topic', protect, adminOnly, subscribeUserToTopic);
router.post('/unsubscribe-topic', protect, adminOnly, unsubscribeUserFromTopic);

// Update FCM token (authenticated users)
router.post('/update-token', protect, updateFCMToken);

// Get user notifications
router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { page = 1, limit = 20, type, isRead } = req.query;

    const filter: any = { userId: user.id };
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const notifications = await Notification.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      userId: user.id, 
      isRead: false 
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
});

// Create notification (admin only)
router.post('/', [
  protect,
  body('userId').optional().isString(),
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').optional().isIn(['exam', 'payment', 'system', 'chat', 'announcement']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
], async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { userId, title, message, type = 'system', priority = 'medium', data, expiresAt } = req.body;

    // If no userId provided, send to all users
    if (!userId) {
      // This would be a broadcast notification - implement based on needs
      return res.status(400).json({
        success: false,
        message: 'User ID is required for individual notifications',
      });
    }

    const notification = new Notification({
      userId,
      title,
      message,
      type,
      priority,
      data,
      expiresAt,
    });

    await notification.save();

    // Send push notification if Firebase is configured
    // await sendPushNotification(userId, title, message);

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
    });
  }
});

// Mark notification as read
router.put('/:id/read', protect, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
});

// Mark all notifications as read
router.put('/read-all', protect, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    await Notification.updateMany(
      { userId: user.id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
    });
  }
});

// Delete notification
router.delete('/:id', protect, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

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
    });
  }
});

// Get notification statistics
router.get('/stats', protect, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const stats = await Notification.aggregate([
      { $match: { userId: user.id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          },
        },
      },
    ]);

    const totalUnread = await Notification.countDocuments({
      userId: user.id,
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        byType: stats,
        totalUnread,
      },
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification statistics',
    });
  }
});

export default router;


