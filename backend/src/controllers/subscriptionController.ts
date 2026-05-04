import type { Request, Response } from 'express';
import Package from '../models/Package';
import PromoCode from '../models/PromoCode';
import Subscription from '../models/Subscription';
import Payment from '../models/Payment';
import User from '../models/User';

// Get all active packages
export const getPackages = async (req: Request, res: Response) => {
  try {
    const packages = await Package.find({ status: 'active' }).sort({ durationDays: 1 });
    
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

// Validate promo code
export const validatePromoCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }
    
    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
      status: 'active'
    });
    
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code'
      });
    }
    
    // Check expiry
    if (new Date() > promoCode.expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Promo code has expired'
      });
    }
    
    // Check usage limit
    if (promoCode.usedCount >= promoCode.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Promo code usage limit reached'
      });
    }
    
    res.json({
      success: true,
      data: {
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue
      },
      message: 'Promo code is valid'
    });
  } catch (error: any) {
    console.error('Validate promo code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate promo code'
    });
  }
};

// Calculate final price with promo code
export const calculatePrice = async (req: Request, res: Response) => {
  try {
    const { packageType, promoCode } = req.body;
    
    if (!packageType) {
      return res.status(400).json({
        success: false,
        message: 'Package type is required'
      });
    }
    
    const pkg = await Package.findOne({ type: packageType, status: 'active' });
    
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    let finalAmount = pkg.price;
    let discountAmount = 0;
    let promoCodeData = null;
    
    if (promoCode) {
      const promo = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        status: 'active'
      });
      
      if (promo && new Date() <= promo.expiryDate && promo.usedCount < promo.usageLimit) {
        if (promo.discountType === 'percentage') {
          discountAmount = (pkg.price * promo.discountValue) / 100;
        } else {
          discountAmount = promo.discountValue;
        }
        
        finalAmount = Math.max(0, pkg.price - discountAmount);
        promoCodeData = {
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue
        };
      }
    }
    
    res.json({
      success: true,
      data: {
        originalPrice: pkg.price,
        discountAmount,
        finalAmount,
        promoCode: promoCodeData
      },
      message: 'Price calculated successfully'
    });
  } catch (error: any) {
    console.error('Calculate price error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate price'
    });
  }
};

// Check user's subscription status
export const checkSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has paid status and subscription is not expired
    const hasActiveSubscription = 
      user.subscriptionStatus === 'paid' && 
      user.subscriptionExpireAt && 
      new Date() < user.subscriptionExpireAt;
    
    // Also check Subscription collection for additional info
    const subscription = await Subscription.findOne({
      user: userId,
      active: true,
      expireAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        hasSubscription: hasActiveSubscription, // Use user.subscriptionStatus instead
        subscriptionStatus: user.subscriptionStatus,
        subscriptionType: user.subscriptionType,
        expireAt: user.subscriptionExpireAt,
        subscription: subscription
      },
      message: 'Subscription status retrieved successfully'
    });
  } catch (error: any) {
    console.error('Check subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check subscription'
    });
  }
};

// Get user's subscription history
export const getSubscriptionHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    const subscriptions = await Subscription.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: subscriptions,
      message: 'Subscription history retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get subscription history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve subscription history'
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const total = await Payment.countDocuments({ user: userId });
    const payments = await Payment.find({ user: userId })
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
      message: 'Payment history retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve payment history'
    });
  }
};
