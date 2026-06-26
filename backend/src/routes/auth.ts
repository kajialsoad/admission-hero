import { Router } from 'express';
import { register, login, forgotPassword, verifyOtp, resetPassword, getProfile, updateProfile, updateFcmToken, deleteAccount } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/fcm-token', protect, updateFcmToken);
router.delete('/delete-account', protect, deleteAccount);

export default router;
