import { Router } from 'express';
import {
  getPerformanceStats,
  getRecentExamResults,
  getExamResultDetails
} from '../controllers/performanceController';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/stats', protect, getPerformanceStats);
router.get('/recent', protect, getRecentExamResults);
router.get('/result/:resultId', protect, getExamResultDetails);

export default router;
