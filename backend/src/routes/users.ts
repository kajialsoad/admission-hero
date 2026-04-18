import { Router } from 'express';
import { protect, adminOnly } from '../middlewares/auth';
import User from '../models/User';
const router = Router();

router.get('/me', protect, async (req:any, res) => {
  res.json(req.user);
});

// Get all users with filtering and pagination (Admin only)
router.get('/', protect, adminOnly, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const subscriptionFilter = req.query.subscriptionFilter || '';

    const skip = (page - 1) * limit;
    let query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Subscription filter
    if (subscriptionFilter === 'free') {
      query.subscriptionStatus = 'free';
    } else if (subscriptionFilter === 'paid') {
      query.subscriptionStatus = 'paid';
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      message: 'Users fetched successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user status (Admin only)
router.put('/:id/status', protect, adminOnly, async (req: any, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: user,
      message: 'User status updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user subscription (Admin only)
router.put('/:id/subscription', protect, adminOnly, async (req: any, res) => {
  try {
    const { subscriptionStatus, subscriptionType, subscriptionExpireAt } = req.body;
    
    const updateData: any = {
      subscriptionStatus,
      subscriptionType: subscriptionStatus === 'paid' ? subscriptionType : null,
      subscriptionExpireAt: subscriptionStatus === 'paid' ? subscriptionExpireAt : null
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: user,
      message: 'User subscription updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
