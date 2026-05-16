import express from 'express';
import {
  getStatistics,
  updateStatistics,
  getStatisticsAdmin,
} from '../controllers/statisticsController';
import { protect, adminOnly } from '../middlewares/auth';

const router = express.Router();

// Public route - get statistics
router.get('/', getStatistics);

// Admin routes
router.get('/admin', protect, adminOnly, getStatisticsAdmin);
router.put('/', protect, adminOnly, updateStatistics);

export default router;
