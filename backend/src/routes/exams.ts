import { Router } from 'express';
import { createExam, listExams, addQuestionsBulk, submitExamResult } from '../controllers/examController';
import { protect, adminOnly, checkSubscription } from '../middlewares/auth';
const router = Router();

router.get('/', listExams);
router.post('/', protect, adminOnly, createExam);
router.post('/add-questions', protect, adminOnly, addQuestionsBulk);
router.post('/submit', protect, checkSubscription, submitExamResult);

export default router;
