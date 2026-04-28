import express from 'express';
import { body, validationResult } from 'express-validator';
import ChatMessage from '../models/ChatMessage';
import auth from '../middlewares/auth';

const router = express.Router();

// Get chat messages for a conversation
router.get('/conversation/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({ conversationId })
      .sort({ timestamp: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: await ChatMessage.countDocuments({ conversationId }),
      },
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat messages',
    });
  }
});

// Send a chat message
router.post('/send', [
  auth,
  body('message').notEmpty().withMessage('Message is required'),
  body('conversationId').notEmpty().withMessage('Conversation ID is required'),
  body('messageType').optional().isIn(['text', 'image', 'file']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { message, conversationId, messageType = 'text', metadata } = req.body;
    const user = (req as any).user;

    const chatMessage = new ChatMessage({
      senderId: user.id,
      senderName: user.name || 'User',
      senderType: user.role === 'admin' ? 'admin' : 'user',
      message,
      messageType,
      conversationId,
      metadata,
    });

    await chatMessage.save();

    // Emit to Socket.IO if available
    const io = (req as any).io;
    if (io) {
      io.to(conversationId).emit('new_message', chatMessage);
    }

    res.status(201).json({
      success: true,
      data: chatMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
});

// Mark messages as read
router.put('/read/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const user = (req as any).user;

    await ChatMessage.updateMany(
      { 
        conversationId,
        senderId: { $ne: user.id }, // Don't mark own messages as read
        isRead: false,
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
    });
  }
});

// Get unread message count
router.get('/unread/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const user = (req as any).user;

    const unreadCount = await ChatMessage.countDocuments({
      conversationId,
      senderId: { $ne: user.id },
      isRead: false,
    });

    res.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
    });
  }
});

// Auto-response for support (simulate admin response)
router.post('/auto-response', [
  auth,
  body('message').notEmpty().withMessage('Message is required'),
  body('conversationId').notEmpty().withMessage('Conversation ID is required'),
], async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    // Simple auto-response logic
    let autoResponse = '';
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('payment') || lowerMessage.includes('bkash')) {
      autoResponse = 'আপনার পেমেন্ট সংক্রান্ত সমস্যার জন্য আমরা দুঃখিত। আমাদের সাপোর্ট টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।';
    } else if (lowerMessage.includes('exam') || lowerMessage.includes('question')) {
      autoResponse = 'পরীক্ষা সংক্রান্ত যেকোনো সমস্যার জন্য আমাদের সাথে যোগাযোগ করুন। আমরা আপনাকে সাহায্য করতে প্রস্তুত।';
    } else if (lowerMessage.includes('login') || lowerMessage.includes('password')) {
      autoResponse = 'লগইন সমস্যার জন্য আপনার ইমেইল এবং ফোন নম্বর যাচাই করুন। প্রয়োজনে পাসওয়ার্ড রিসেট করুন।';
    } else {
      autoResponse = 'আপনার বার্তার জন্য ধন্যবাদ। আমাদের সাপোর্ট টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।';
    }

    // Create auto-response message
    const autoMessage = new ChatMessage({
      senderId: 'system',
      senderName: 'Support Bot',
      senderType: 'system',
      message: autoResponse,
      messageType: 'text',
      conversationId,
    });

    await autoMessage.save();

    // Emit to Socket.IO if available
    const io = (req as any).io;
    if (io) {
      io.to(conversationId).emit('new_message', autoMessage);
    }

    res.status(201).json({
      success: true,
      data: autoMessage,
    });
  } catch (error) {
    console.error('Auto-response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send auto-response',
    });
  }
});

export default router;