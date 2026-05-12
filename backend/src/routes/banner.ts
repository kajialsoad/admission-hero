import { Router } from 'express';
import {
  getAllBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from '../controllers/bannerController';
import { protect, adminOnly } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/active', getActiveBanners);

// Admin routes
router.get('/', protect, adminOnly, getAllBanners);
router.post('/', protect, adminOnly, createBanner);
router.put('/:id', protect, adminOnly, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

export default router;
