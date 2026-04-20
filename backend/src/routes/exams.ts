import { Router } from 'express';
import { createExam, listExams, addQuestionsBulk, submitExamResult, getUserPerformanceStats, getRecentExamResults } from '../controllers/examController';
import { protect, adminOnly, checkSubscription } from '../middlewares/auth';
const router = Router();

router.get('/', listExams);
router.post('/', protect, adminOnly, createExam);
router.post('/add-questions', protect, adminOnly, addQuestionsBulk);
router.post('/submit', protect, submitExamResult);

// Performance endpoints (authenticated)
router.get('/performance/stats', protect, getUserPerformanceStats);
router.get('/performance/recent', protect, getRecentExamResults);

export default router;
