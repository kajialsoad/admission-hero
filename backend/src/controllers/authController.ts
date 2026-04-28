import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';

function signToken(id: string) {
  const secret: any = process.env.JWT_SECRET || 'secret';
  const expiresIn: any = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
}

// Resend HTTP API - works on Railway (no SMTP needed)
const resend = new Resend(process.env.RESEND_API_KEY || 're_FMJuYZSj_2tLf4Jy7HvedQQ1e4ewL7RUP');

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

    // Send email via Resend (HTTP API - works on Railway)
    const { error: emailError } = await resend.emails.send({
      from: 'Admission Hero <onboarding@resend.dev>',
      to: [email],
      subject: 'পাসওয়ার্ড রিসেট OTP - Admission Hero',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <h2 style="color: #4F46E5; text-align: center;">Admission Hero</h2>
          <p style="font-size: 16px;">আপনার পাসওয়ার্ড রিসেট করতে নিচের <strong>OTP</strong> ব্যবহার করুন:</p>
          <div style="background: #f0f0ff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; letter-spacing: 8px; font-size: 36px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">এই OTP <strong>15 মিনিট</strong> পর্যন্ত valid থাকবে।</p>
          <p style="color: #999; font-size: 12px;">আপনি যদি পাসওয়ার্ড রিসেটের অনুরোধ না করে থাকেন, এই ইমেইল উপেক্ষা করুন।</p>
        </div>
      `,
    });
    if (emailError) {
      console.error('Resend email error:', emailError);
      throw new Error(emailError.message);
    }

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
