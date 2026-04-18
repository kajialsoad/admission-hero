import { Request, Response } from 'express';
import User from '../models/User';
import Exam from '../models/Exam';
import Question from '../models/Question';
import Video from '../models/Video';

export const dashboard = async (req: Request, res: Response) => {
  const totalUsers = await User.countDocuments();
  const totalExams = await Exam.countDocuments();
  const totalQuestions = await Question.countDocuments();
  const totalVideos = await Video.countDocuments();
  // earnings and subscriptions would come from Payments/Subscriptions in a full implementation
  res.json({ totalUsers, totalExams, totalQuestions, totalVideos });
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
