import type { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Subscription from '../models/Subscription';

export const requireSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        requiresSubscription: true
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        requiresSubscription: true
      });
    }

    // Check if user has active subscription
    if (user.subscriptionStatus === 'Premium' && user.subscriptionExpireAt) {
      if (new Date() < user.subscriptionExpireAt) {
        // Subscription is active
        return next();
      }
    }

    // Check in Subscription collection as well
    const subscription = await Subscription.findOne({
      user: userId,
      active: true,
      expireAt: { $gt: new Date() }
    });

    if (subscription) {
      // Update user if subscription exists but user status is not updated
      if (user.subscriptionStatus !== 'Premium') {
        await User.findByIdAndUpdate(userId, {
          subscriptionStatus: 'Premium',
          subscriptionExpireAt: subscription.expireAt
        });
      }
      return next();
    }

    // No active subscription
    return res.status(403).json({
      success: false,
      message: 'Active subscription required to access this content',
      requiresSubscription: true,
      subscriptionStatus: user.subscriptionStatus
    });
  } catch (error: any) {
    console.error('Subscription check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify subscription',
      requiresSubscription: true
    });
  }
};

export const checkSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    
    if (!userId) {
      (req as any).hasSubscription = false;
      return next();
    }

    const user = await User.findById(userId);
    
    if (!user) {
      (req as any).hasSubscription = false;
      return next();
    }

    // Check if user has active subscription
    const hasActiveSubscription = 
      user.subscriptionStatus === 'Premium' && 
      user.subscriptionExpireAt && 
      new Date() < user.subscriptionExpireAt;

    (req as any).hasSubscription = hasActiveSubscription;
    (req as any).subscriptionExpireAt = user.subscriptionExpireAt;
    
    next();
  } catch (error: any) {
    console.error('Subscription status check error:', error);
    (req as any).hasSubscription = false;
    next();
  }
};
