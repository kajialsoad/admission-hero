import express from 'express';
import { body, validationResult } from 'express-validator';
import Analytics from '../models/Analytics';
import auth from '../middlewares/auth';

const router = express.Router();

// Track analytics event
router.post('/track', [
  body('eventType').isIn(['login', 'exam_start', 'exam_complete', 'payment', 'video_watch', 'page_view']),
  body('eventData').isObject(),
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

    const { eventType, eventData, sessionId, deviceInfo, location } = req.body;
    
    // Get user ID from auth if available
    let userId;
    try {
      const user = (req as any).user;
      userId = user?.id;
    } catch {
      // Anonymous tracking allowed
    }

    const analytics = new Analytics({
      userId,
      eventType,
      eventData,
      sessionId,
      deviceInfo,
      location,
    });

    await analytics.save();

    res.status(201).json({
      success: true,
      message: 'Event tracked successfully',
    });
  } catch (error) {
    console.error('Track analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event',
    });
  }
});

// Get analytics dashboard data (admin only)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { startDate, endDate } = req.query;
    const dateFilter: any = {};
    
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    const filter = dateFilter.$gte || dateFilter.$lte ? { timestamp: dateFilter } : {};

    // Event counts by type
    const eventCounts = await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Daily active users
    const dailyActiveUsers = await Analytics.aggregate([
      { $match: { ...filter, userId: { $exists: true } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          date: '$_id.date',
          count: { $size: '$uniqueUsers' },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Platform distribution
    const platformStats = await Analytics.aggregate([
      { $match: { ...filter, 'deviceInfo.platform': { $exists: true } } },
      {
        $group: {
          _id: '$deviceInfo.platform',
          count: { $sum: 1 },
        },
      },
    ]);

    // Exam completion rates
    const examStats = await Analytics.aggregate([
      { $match: { ...filter, eventType: { $in: ['exam_start', 'exam_complete'] } } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
    ]);

    const examStarted = examStats.find(s => s._id === 'exam_start')?.count || 0;
    const examCompleted = examStats.find(s => s._id === 'exam_complete')?.count || 0;
    const completionRate = examStarted > 0 ? (examCompleted / examStarted) * 100 : 0;

    // Recent activity
    const recentActivity = await Analytics.find(filter)
      .sort({ timestamp: -1 })
      .limit(50)
      .select('eventType eventData timestamp userId deviceInfo');

    res.json({
      success: true,
      data: {
        eventCounts,
        dailyActiveUsers,
        platformStats,
        examCompletionRate: Math.round(completionRate * 100) / 100,
        recentActivity,
        summary: {
          totalEvents: await Analytics.countDocuments(filter),
          uniqueUsers: await Analytics.distinct('userId', { ...filter, userId: { $exists: true } }).then(users => users.length),
          examStarted,
          examCompleted,
        },
      },
    });
  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
    });
  }
});

// Get user analytics (for individual user)
router.get('/user', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    const filter = {
      userId: user.id,
      ...(dateFilter.$gte || dateFilter.$lte ? { timestamp: dateFilter } : {}),
    };

    // User activity summary
    const activitySummary = await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
        },
      },
    ]);

    // Daily activity
    const dailyActivity = await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            eventType: '$eventType',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Exam performance
    const examPerformance = await Analytics.find({
      ...filter,
      eventType: 'exam_complete',
    }).select('eventData timestamp');

    res.json({
      success: true,
      data: {
        activitySummary,
        dailyActivity,
        examPerformance,
        totalEvents: await Analytics.countDocuments(filter),
      },
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
    });
  }
});

// Get real-time stats (admin only)
router.get('/realtime', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Active users in last hour
    const activeUsersLastHour = await Analytics.distinct('userId', {
      timestamp: { $gte: oneHourAgo },
      userId: { $exists: true },
    });

    // Events in last hour
    const eventsLastHour = await Analytics.countDocuments({
      timestamp: { $gte: oneHourAgo },
    });

    // Active exams
    const activeExams = await Analytics.countDocuments({
      eventType: 'exam_start',
      timestamp: { $gte: oneDayAgo },
    }) - await Analytics.countDocuments({
      eventType: 'exam_complete',
      timestamp: { $gte: oneDayAgo },
    });

    // Recent events
    const recentEvents = await Analytics.find({
      timestamp: { $gte: oneHourAgo },
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .select('eventType timestamp userId deviceInfo');

    res.json({
      success: true,
      data: {
        activeUsersLastHour: activeUsersLastHour.length,
        eventsLastHour,
        activeExams: Math.max(0, activeExams),
        recentEvents,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error('Get realtime analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch realtime analytics',
    });
  }
});

export default router;