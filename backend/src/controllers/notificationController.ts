import { Request, Response } from 'express';
import {
  sendNotificationToDevice,
  sendNotificationToMultipleDevices,
  sendNotificationToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
} from '../services/firebaseService';
import Notification from '../models/Notification';
import User from '../models/User';

// Send notification
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { title, body, tokens, topic, data, userIds } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required',
      });
    }

    let response;
    let targetUsers: string[] = [];

    if (topic) {
      // Send to topic
      response = await sendNotificationToTopic(topic, title, body, data);
      
      // Save notification to database
      const notification = new Notification({
        title,
        message: body, // Add message field for compatibility
        body: body, // Use body parameter
        data: data || {},
        topic,
        sentAt: new Date(),
        sentBy: (req as any).user?.id || undefined,
      });
      await notification.save();

    } else if (tokens && tokens.length > 0) {
      // Send to specific tokens
      if (tokens.length === 1) {
        response = await sendNotificationToDevice(tokens[0], title, body, data);
      } else {
        response = await sendNotificationToMultipleDevices(tokens, title, body, data);
      }

      // Save notification to database
      const notification = new Notification({
        title,
        message: body, // Add message field for compatibility
        body: body, // Use body parameter
        data: data || {},
        tokens,
        sentAt: new Date(),
        sentBy: (req as any).user?.id || undefined,
      });
      await notification.save();

    } else if (userIds && userIds.length > 0) {
      // Send to specific users by their IDs
      const users = await User.find({ 
        _id: { $in: userIds },
        fcmToken: { $exists: true, $ne: null }
      });

      const userTokens = users
        .map(user => user.fcmToken)
        .filter((token): token is string => Boolean(token));

      if (userTokens.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid FCM tokens found for the specified users',
        });
      }

      if (userTokens.length === 1) {
        response = await sendNotificationToDevice(userTokens[0], title, body, data);
      } else {
        response = await sendNotificationToMultipleDevices(userTokens, title, body, data);
      }

      targetUsers = userIds;

      // Save notification to database
      const notification = new Notification({
        title,
        message: body, // Add message field for compatibility
        body: body, // Use body parameter
        data: data || {},
        users: targetUsers,
        sentAt: new Date(),
        sentBy: (req as any).user?.id || undefined,
      });
      await notification.save();

    } else {
      return res.status(400).json({
        success: false,
        message: 'Either tokens, topic, or userIds must be provided',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      response,
    });

  } catch (error: any) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send notification',
    });
  }
};

// Get notification history
export const getNotificationHistory = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const notifications = await Notification.find()
      .populate('sentBy', 'name email')
      .populate('users', 'name email phone')
      .sort({ sentAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Notification.countDocuments();

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });

  } catch (error: any) {
    console.error('Get notification history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get notification history',
    });
  }
};

// Subscribe user to topic
export const subscribeUserToTopic = async (req: Request, res: Response) => {
  try {
    const { tokens, topic } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tokens array is required',
      });
    }

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required',
      });
    }

    const response = await subscribeToTopic(tokens, topic);

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed to topic',
      response,
    });

  } catch (error: any) {
    console.error('Subscribe to topic error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to subscribe to topic',
    });
  }
};

// Unsubscribe user from topic
export const unsubscribeUserFromTopic = async (req: Request, res: Response) => {
  try {
    const { tokens, topic } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tokens array is required',
      });
    }

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required',
      });
    }

    const response = await unsubscribeFromTopic(tokens, topic);

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from topic',
      response,
    });

  } catch (error: any) {
    console.error('Unsubscribe from topic error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unsubscribe from topic',
    });
  }
};

// Update user FCM token
export const updateFCMToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    await User.findByIdAndUpdate(userId, { fcmToken });

    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully',
    });

  } catch (error: any) {
    console.error('Update FCM token error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update FCM token',
    });
  }
};