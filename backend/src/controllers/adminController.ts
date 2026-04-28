import { Request, Response } from 'express';
import User from '../models/User';
import Exam from '../models/Exam';
import Question from '../models/Question';
import Video from '../models/Video';
import Subscription from '../models/Subscription';

export const dashboard = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalExams = await Exam.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalVideos = await Video.countDocuments();

    // Calculate total revenue from active/paid subscriptions
    const subscriptions = await Subscription.find({});
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);

    // Generate graph data (last 6 months revenue & orders)
    const graphDataMap: { [key: string]: { name: string; orders: number; revenue: number } } = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = months[d.getMonth()];
      graphDataMap[monthName] = { name: monthName, orders: 0, revenue: 0 };
    }

    subscriptions.forEach(sub => {
      if (!sub.createdAt) return;
      const d = new Date(sub.createdAt as any);
      const monthName = months[d.getMonth()];
      if (graphDataMap[monthName]) {
        graphDataMap[monthName].orders += 1;
        graphDataMap[monthName].revenue += sub.amount || 0;
      }
    });

    const graphData = Object.values(graphDataMap);

    // Fetch recent 10 payments
    const recentPayments = await Subscription.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email phone');

    res.json({
      success: true,
      message: 'Dashboard stats fetched successfully',
      data: {
        totalUsers,
        totalExams,
        totalQuestions,
        totalVideos,
        totalRevenue,
        graphData,
        recentPayments
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard data' });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      phone,
      password,
      role: 'admin',
      isVerified: true,
      isActive: true,
      subscriptionStatus: 'paid'
    });

    const adminData = admin.toObject();
    delete adminData.password;

    return res.json({ success: true, data: adminData, message: 'Admin created successfully' });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ error: 'Failed to create admin' });
  }
};
