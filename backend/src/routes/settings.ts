import express from 'express';
import { getPublicSettings, getContactInfo, updateSettings } from '../controllers/settingsController';
import { protect, adminOnly } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/public', getPublicSettings);
router.get('/contact-info', getContactInfo);

// Admin routes
router.put('/', protect, adminOnly, updateSettings);

export default router;
