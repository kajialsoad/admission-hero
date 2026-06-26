import { Request, Response } from 'express';
import User from '../models/User';
import Exam from '../models/Exam';
import Question from '../models/Question';
import Video from '../models/Video';
import Subscription from '../models/Subscription';
import Payment from '../models/Payment';
import Package from '../models/Package';
import PromoCode from '../models/PromoCode';

export const dashboard = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalExams = await Exam.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalVideos = await Video.countDocuments();

    // Calculate total revenue from active/Premium subscriptions
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
    const { name, email, phone, password, allowedPages } = req.body;

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
      subscriptionStatus: 'Premium',
      allowedPages: allowedPages || []
    });

    const adminData = admin.toObject();
    delete adminData.password;

    return res.json({ success: true, data: adminData, message: 'Admin created successfully' });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ error: 'Failed to create admin' });
  }
};


// ============ PACKAGE MANAGEMENT ============

export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const packages = await Package.find().sort({ durationDays: 1 });
    
    res.json({
      success: true,
      data: packages,
      message: 'Packages retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get packages error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve packages'
    });
  }
};

export const createPackage = async (req: Request, res: Response) => {
  try {
    const { type, name, durationDays, price, features, description, status, videoUrl } = req.body;
    
    if (!type || !name || !durationDays || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, name, durationDays, price'
      });
    }
    
    const pkg = await Package.create({
      type,
      name,
      durationDays,
      price,
      features: features || [],
      description: description || '',
      status: status || 'active',
      videoUrl: videoUrl || ''
    });
    
    res.status(201).json({
      success: true,
      data: pkg,
      message: 'Package created successfully'
    });
  } catch (error: any) {
    console.error('Create package error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create package'
    });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, durationDays, price, features, description, status, videoUrl } = req.body;
    
    console.log('📦 UPDATE PACKAGE - ID:', id);
    console.log('📦 UPDATE PACKAGE - Request body:', JSON.stringify(req.body, null, 2));
    console.log('📦 UPDATE PACKAGE - description:', description);
    console.log('📦 UPDATE PACKAGE - videoUrl:', videoUrl);
    
    const pkg = await Package.findByIdAndUpdate(
      id,
      { name, durationDays, price, features, description, status, videoUrl },
      { new: true, runValidators: true }
    );
    
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    console.log('✅ UPDATE PACKAGE - Updated package:', JSON.stringify(pkg, null, 2));
    
    res.json({
      success: true,
      data: pkg,
      message: 'Package updated successfully'
    });
  } catch (error: any) {
    console.error('Update package error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update package'
    });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const pkg = await Package.findByIdAndDelete(id);
    
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete package error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete package'
    });
  }
};

// ============ PROMO CODE MANAGEMENT ============

export const getAllPromoCodes = async (req: Request, res: Response) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: promoCodes,
      message: 'Promo codes retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get promo codes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve promo codes'
    });
  }
};

export const createPromoCode = async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, expiryDate, usageLimit, status } = req.body;
    
    if (!code || !discountType || !discountValue || !expiryDate || !usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const promoCode = await PromoCode.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiryDate,
      usageLimit,
      status: status || 'active'
    });
    
    res.status(201).json({
      success: true,
      data: promoCode,
      message: 'Promo code created successfully'
    });
  } catch (error: any) {
    console.error('Create promo code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create promo code'
    });
  }
};

export const updatePromoCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { discountType, discountValue, expiryDate, usageLimit, status } = req.body;
    
    const promoCode = await PromoCode.findByIdAndUpdate(
      id,
      { discountType, discountValue, expiryDate, usageLimit, status },
      { new: true, runValidators: true }
    );
    
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }
    
    res.json({
      success: true,
      data: promoCode,
      message: 'Promo code updated successfully'
    });
  } catch (error: any) {
    console.error('Update promo code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update promo code'
    });
  }
};

export const deletePromoCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const promoCode = await PromoCode.findByIdAndDelete(id);
    
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete promo code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete promo code'
    });
  }
};

// ============ PAYMENT MANAGEMENT ============

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const method = req.query.method as string;
    
    const query: any = {};
    if (status) query.status = status;
    if (method) query.method = method;
    
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('user', 'name email phone')
      .populate('subscription')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      message: 'Payments retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve payments'
    });
  }
};

export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const active = req.query.active as string;
    
    const query: any = {};
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    const total = await Subscription.countDocuments(query);
    const subscriptions = await Subscription.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.json({
      success: true,
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      message: 'Subscriptions retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve subscriptions'
    });
  }
};


// ============ USER SUBSCRIPTION MANAGEMENT ============

export const updateUserSubscription = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { subscriptionStatus, subscriptionType, subscriptionExpireAt } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If changing to free, clear all subscription data
    if (subscriptionStatus === 'free') {
      user.subscriptionStatus = 'free';
      user.subscriptionType = undefined;
      user.subscriptionExpireAt = undefined;
      
      // Deactivate any active subscriptions
      await Subscription.updateMany(
        { user: userId, active: true },
        { active: false }
      );
      
      await user.save();
      
      console.log(`User ${userId} changed to free - cleared subscription data`);
      
      return res.json({
        success: true,
        data: user,
        message: 'User subscription updated to free successfully'
      });
    }

    // If changing to Premium, calculate duration and expiry
    if (subscriptionStatus === 'Premium') {
      // Calculate duration days based on subscription type
      let durationDays = 0;
      if (subscriptionType === '1-month') durationDays = 30;
      else if (subscriptionType === '3-month') durationDays = 90;
      else if (subscriptionType === '6-month') durationDays = 180;
      else if (subscriptionType === '12-month') durationDays = 365;

      if (durationDays === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription type for Premium user'
        });
      }

      // Calculate expiry date from now
      const expireAt = new Date();
      expireAt.setDate(expireAt.getDate() + durationDays);

      // Update user
      user.subscriptionStatus = 'Premium';
      user.subscriptionType = subscriptionType;
      user.subscriptionExpireAt = expireAt;
      
      await user.save();

      // Create subscription record
      const subscription = new Subscription({
        user: userId,
        packageName: `${subscriptionType.replace('-', ' ')} (Admin Granted)`,
        planId: subscriptionType,
        startAt: new Date(),
        expireAt: expireAt,
        active: true,
        paymentMethod: 'admin',
        amount: 0,
        duration: durationDays,
      });
      
      await subscription.save();
      
      console.log(`User ${userId} changed to Premium - ${subscriptionType} (${durationDays} days)`);

      return res.json({
        success: true,
        data: user,
        message: `User subscription updated to ${subscriptionType} successfully`
      });
    }

    // If neither free nor Premium specified, just update what was provided
    user.subscriptionStatus = subscriptionStatus || user.subscriptionStatus;
    user.subscriptionType = subscriptionType || user.subscriptionType;
    if (subscriptionExpireAt) {
      user.subscriptionExpireAt = new Date(subscriptionExpireAt);
    }
    
    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'User subscription updated successfully'
    });
  } catch (error: any) {
    console.error('Update user subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user subscription'
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const subscriptionStatus = req.query.subscriptionStatus as string;
    const role = req.query.role as string;
    
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (subscriptionStatus && subscriptionStatus !== 'all') {
      query.subscriptionStatus = subscriptionStatus;
    }

    if (role && role !== 'all') {
      query.role = role;
    }
    
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -resetOtp -resetOtpExpiry -resetToken -resetTokenExpiry')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      message: 'Users retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve users'
    });
  }
};


// ============ PAYMENT SETTINGS MANAGEMENT ============

import PaymentSettings from '../models/PaymentSettings';

export const getPaymentSettings = async (req: Request, res: Response) => {
  try {
    let settings = await PaymentSettings.findOne();
    
    // Create default settings if not exists
    if (!settings) {
      settings = await PaymentSettings.create({
        bkashEnabled: true,
        googlePlayEnabled: false,
        bkashConfig: {
          username: process.env.BKASH_USERNAME || '',
          password: process.env.BKASH_PASSWORD || '',
          appKey: process.env.BKASH_APP_KEY || '',
          appSecret: process.env.BKASH_APP_SECRET || '',
          baseUrl: process.env.BKASH_BASE_URL || 'https://tokenized.pay.bka.sh/v1.2.0-beta'
        },
        googlePlayConfig: {
          productIds: []
        }
      });
    }
    
    res.json({
      success: true,
      data: settings,
      message: 'Payment settings retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get payment settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve payment settings'
    });
  }
};

export const updatePaymentSettings = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id || (req as any).user?._id;
    const { bkashEnabled, googlePlayEnabled, bkashConfig, googlePlayConfig } = req.body;
    
    let settings = await PaymentSettings.findOne();
    
    if (!settings) {
      settings = new PaymentSettings();
    }
    
    // Update settings
    if (bkashEnabled !== undefined) settings.bkashEnabled = bkashEnabled;
    if (googlePlayEnabled !== undefined) settings.googlePlayEnabled = googlePlayEnabled;
    
    if (bkashConfig) {
      settings.bkashConfig = {
        ...settings.bkashConfig,
        ...bkashConfig
      };
    }
    
    if (googlePlayConfig) {
      settings.googlePlayConfig = {
        ...settings.googlePlayConfig,
        ...googlePlayConfig
      };
    }
    
    settings.updatedBy = adminId;
    await settings.save();
    
    res.json({
      success: true,
      data: settings,
      message: 'Payment settings updated successfully'
    });
  } catch (error: any) {
    console.error('Update payment settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update payment settings'
    });
  }
};

// Public endpoint for Flutter app to check enabled payment methods
export const getEnabledPaymentMethods = async (req: Request, res: Response) => {
  try {
    let settings = await PaymentSettings.findOne();
    
    if (!settings) {
      settings = await PaymentSettings.create({
        bkashEnabled: true,
        googlePlayEnabled: false
      });
    }
    
    res.json({
      success: true,
      data: {
        bkashEnabled: settings.bkashEnabled,
        googlePlayEnabled: settings.googlePlayEnabled
      },
      message: 'Enabled payment methods retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get enabled payment methods error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve enabled payment methods'
    });
  }
};

export const updateUserPermissions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { allowedPages } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!Array.isArray(allowedPages)) {
      return res.status(400).json({
        success: false,
        message: 'allowedPages must be an array of strings'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Permissions can only be updated for admin users'
      });
    }

    user.allowedPages = allowedPages;
    // @ts-ignore
    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'Admin permissions updated successfully'
    });
  } catch (error: any) {
    console.error('Update user permissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user permissions'
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, subscriptionStatus, subscriptionType } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, Phone, and Password are required' });
    }

    // Check if user already exists
    const existing = await User.findOne({ $or: [{ email: email ? email.trim().toLowerCase() : undefined }, { phone: phone.trim() }].filter(Boolean) });
    if (existing) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    let expireAt = undefined;
    if (subscriptionStatus === 'Premium' && subscriptionType) {
      let durationDays = 0;
      if (subscriptionType === '1-month') durationDays = 30;
      else if (subscriptionType === '3-month') durationDays = 90;
      else if (subscriptionType === '6-month') durationDays = 180;
      else if (subscriptionType === '12-month') durationDays = 365;

      if (durationDays > 0) {
        expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + durationDays);
      }
    }

    // Create user
    const user = await User.create({
      name,
      email: email ? email.trim().toLowerCase() : undefined,
      phone,
      password,
      role: 'user',
      isVerified: true,
      isActive: true,
      subscriptionStatus: subscriptionStatus || 'free',
      subscriptionType: subscriptionStatus === 'Premium' ? subscriptionType : undefined,
      subscriptionExpireAt: expireAt
    });

    // Create Subscription record if Premium
    if (subscriptionStatus === 'Premium' && expireAt) {
      let durationDays = 0;
      if (subscriptionType === '1-month') durationDays = 30;
      else if (subscriptionType === '3-month') durationDays = 90;
      else if (subscriptionType === '6-month') durationDays = 180;
      else if (subscriptionType === '12-month') durationDays = 365;

      const subscription = new Subscription({
        user: user._id,
        packageName: `${subscriptionType.replace('-', ' ')} (Admin Granted)`,
        planId: subscriptionType,
        startAt: new Date(),
        expireAt: expireAt,
        active: true,
        paymentMethod: 'admin',
        amount: 0,
        duration: durationDays,
      });
      await subscription.save();
    }

    const userData = user.toObject();
    delete userData.password;

    return res.json({ success: true, data: userData, message: 'User created successfully' });
  } catch (error: any) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create user' });
  }
};
