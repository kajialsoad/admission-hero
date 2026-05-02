import { Router } from 'express';
import {
  getPackages,
  validatePromoCode,
  calculatePrice,
  checkSubscription,
  getSubscriptionHistory,
  getPaymentHistory
} from '../controllers/subscriptionController';
import { getEnabledPaymentMethods } from '../controllers/adminController';
import { protect } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/packages', getPackages);
router.post('/validate-promo', validatePromoCode);
router.post('/calculate-price', calculatePrice);

// Public route to get enabled payment methods
router.get('/payment-methods', getEnabledPaymentMethods);

// Protected routes
router.get('/status', protect, checkSubscription);
router.get('/history', protect, getSubscriptionHistory);
router.get('/payments', protect, getPaymentHistory);

export default router;
