import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

function signToken(id: string) {
  const secret: any = process.env.JWT_SECRET || 'secret';
  const expiresIn: any = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
}

export const register = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
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
      $or: [{ email: phoneOrEmail }, { phone: phoneOrEmail }],
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



export const forgotPassword = async (req: Request, res: Response) => {
  // Simple password reset token mock
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  // In production: send email with secure token
  return res.json({ message: 'Password reset link (mock) sent', resetToken: 'mock-token' });
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
