import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  isVerified: boolean;
  role: 'user' | 'admin';
  subscriptionStatus: 'free' | 'paid';
  subscriptionType?: '1-month' | '3-month' | '6-month' | '12-month';
  subscriptionExpireAt?: Date;
  totalScore: number;
  isActive: boolean;
  fcmToken?: string;
  resetOtp?: string;
  resetOtpExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { type: String },
  email: { type: String, index: true, unique: false, sparse: true },
  phone: { type: String, index: true, unique: false, sparse: true },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscriptionStatus: { type: String, enum: ['free', 'paid'], default: 'free', index: true },
  subscriptionType: {
    type: String,
    enum: ['1-month', '3-month', '6-month', '12-month', null], // ← add 12-month
    default: null
  },
  subscriptionExpireAt: { type: Date, default: null },
  totalScore: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  fcmToken: { type: String, default: null },
  resetOtp: { type: String, default: null, select: false },
  resetOtpExpiry: { type: Date, default: null, select: false },
  resetToken: { type: String, default: null, select: false },
  resetTokenExpiry: { type: Date, default: null, select: false },
}, { timestamps: true });

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
