import { Router } from 'express';
import { register, login, forgotPassword, verifyOtp, resetPassword, getProfile, updateFcmToken } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.post('/fcm-token', protect, updateFcmToken);

export default router;
