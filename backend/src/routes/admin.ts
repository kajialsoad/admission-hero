import { Router } from 'express';
import {
  dashboard,
  createAdmin,
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  getAllPayments,
  getAllSubscriptions,
  updateUserSubscription,
  getAllUsers,
  getPaymentSettings,
  updatePaymentSettings,
  getEnabledPaymentMethods
} from '../controllers/adminController';
import { protect, adminOnly } from '../middlewares/auth';

const router = Router();

// Dashboard
router.get('/dashboard', protect, adminOnly, dashboard);
router.post('/create-admin', protect, adminOnly, createAdmin);

// User Management
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:userId/subscription', protect, adminOnly, updateUserSubscription);

// Package Management
router.get('/packages', protect, adminOnly, getAllPackages);
router.post('/packages', protect, adminOnly, createPackage);
router.put('/packages/:id', protect, adminOnly, updatePackage);
router.delete('/packages/:id', protect, adminOnly, deletePackage);

// Promo Code Management
router.get('/promo-codes', protect, adminOnly, getAllPromoCodes);
router.post('/promo-codes', protect, adminOnly, createPromoCode);
router.put('/promo-codes/:id', protect, adminOnly, updatePromoCode);
router.delete('/promo-codes/:id', protect, adminOnly, deletePromoCode);

// Payment & Subscription Management
router.get('/payments', protect, adminOnly, getAllPayments);
router.get('/subscriptions', protect, adminOnly, getAllSubscriptions);

// Payment Settings Management
router.get('/payment-settings', protect, adminOnly, getPaymentSettings);
router.put('/payment-settings', protect, adminOnly, updatePaymentSettings);

export default router;
