import { Request, Response } from 'express';
import User from '../models/User';
import ExamResult from '../models/ExamResult';
import Subscription from '../models/Subscription';
import Payment from '../models/Payment';
import ChatMessage from '../models/ChatMessage';
import Notification from '../models/Notification';
import Bookmark from '../models/Bookmark';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendOtpEmail } from '../services/emailService';

function signToken(id: string) {
  const secret: any = process.env.JWT_SECRET || 'secret';
  const expiresIn: any = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
}

// Email service handles Gmail SMTP (primary) + Resend (fallback)

export const register = async (req: Request, res: Response) => {
  const { name, phone, password } = req.body;
  let { email } = req.body;
  if (email) email = email.trim().toLowerCase();

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) return res.status(400).json({ error: 'User exists with given email or phone' });
  const user = await User.create({ name, email, phone, password, isVerified: !!email });
  const token = signToken(user._id.toString());
  res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone }, token });
};

// Simple login supporting email/password or phone (OTP mock)
export const login = async (req: Request, res: Response) => {
  console.log("REQ BODY:", req.body);
  try {
    const { phoneOrEmail, password } = req.body;

    if (!phoneOrEmail || !password) {
      return res.status(400).json({ error: "Email/Phone and password required" });
    }

    // Security check: explicitly block default insecure admin credentials
    const cleanEmail = phoneOrEmail.trim().toLowerCase();
    if (
      (cleanEmail === 'admin@admissionhero.com' || cleanEmail === 'admin@gmail.com' || cleanEmail === 'admin@hero.test') &&
      (password === 'admin123456' || password === 'admin123')
    ) {
      return res.status(400).json({ error: "Invalid credentials (default insecure credentials blocked)" });
    }

    // Find by email or phone
    const user = await User.findOne({
      $or: [{ email: phoneOrEmail.trim().toLowerCase() }, { phone: phoneOrEmail.trim() }],
    }).select("+password");

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = signToken(user._id.toString());

    const userData = user.toObject();
    delete userData.password;

    return res.json({ success: true, token, user: userData });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};



// ── Step 1: Send OTP to email ─────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ error: 'No account found with this email. Please check the spelling.' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save OTP hash and expiry to user
    await User.findByIdAndUpdate(user._id, {
      resetOtp: otpHash,
      resetOtpExpiry: otpExpiry,
    });

    // Send OTP email — Gmail SMTP (primary) + Resend (fallback)
    await sendOtpEmail(email.trim().toLowerCase(), otp);

    return res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
};

// ── Step 2: Verify OTP ────────────────────────────────────────────────────
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const user = await (User as any).findOne({ email: email.trim().toLowerCase() }).select('+resetOtp +resetOtpExpiry');
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    }

    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    const otpHash = crypto.createHash('sha256').update(otp.toString()).digest('hex');
    if (otpHash !== user.resetOtp) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Generate a short-lived reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    await User.findByIdAndUpdate(user._id, {
      resetOtp: null,
      resetOtpExpiry: null,
      resetToken: resetTokenHash,
      resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    return res.json({ success: true, resetToken, message: 'OTP verified. You can now reset your password.' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'OTP verification failed.' });
  }
};

// ── Step 3: Reset Password ────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: 'Email, reset token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await (User as any).findOne({
      email: email.trim().toLowerCase(),
      resetToken: tokenHash,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save(); // triggers bcrypt hash via pre-save hook

    return res.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Password reset failed.' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is added by auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is added by auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, email, phone, avatar } = req.body;

    // Check if email or phone is already taken by another user
    if (email || phone) {
      const existing = await User.findOne({
        $or: [
          { email: email?.trim().toLowerCase() },
          { phone: phone?.trim() }
        ],
        _id: { $ne: userId }
      });
      if (existing) {
        return res.status(400).json({ error: 'Email or phone already in use by another account' });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (phone) updateData.phone = phone.trim();
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ success: true, user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

export const updateFcmToken = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is added by auth middleware
    const userId = req.user?.id;
    const { fcmToken } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ success: true, message: 'FCM token updated successfully' });
  } catch (error) {
    console.error("UPDATE FCM TOKEN ERROR:", error);
    return res.status(500).json({ error: "Failed to update FCM token" });
  }
};

// ── Delete Account ──────────────────────────────────────────────────────────
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is added by auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    // Verify password before deleting
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Delete all user-related data
    const userIdStr = userId.toString();
    await Promise.all([
      ExamResult.deleteMany({ userId }),
      Subscription.deleteMany({ user: userId }),
      Payment.deleteMany({ user: userId }),
      ChatMessage.deleteMany({ senderId: userIdStr }),
      Notification.deleteMany({ userId: userIdStr }),
      Bookmark.deleteMany({ user: userId }),
    ]);

    // Delete the user itself
    await User.findByIdAndDelete(userId);

    console.log(`Account deleted for user: ${userId}`);
    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    return res.status(500).json({ error: "Failed to delete account" });
  }
};
