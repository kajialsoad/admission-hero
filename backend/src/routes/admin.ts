import { Router } from 'express';
import { dashboard, createAdmin } from '../controllers/adminController';
import { protect, adminOnly } from '../middlewares/auth';
const router = Router();

router.get('/dashboard', protect, adminOnly, dashboard);
router.post('/create-admin', protect, adminOnly, createAdmin);

export default router;
