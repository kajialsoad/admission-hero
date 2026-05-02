import mongoose, { Schema, Document } from 'mongoose';

export interface IPackage extends Document {
  type: 'monthly' | 'yearly' | '3_months' | '6_months' | '12_months';
  name: string;
  durationDays: number;
  price: number;
  features: string[];
  videoUrl?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema({
  type: {
    type: String,
    enum: ['monthly', 'yearly', '3_months', '6_months', '12_months'],
    required: true,
    unique: true
  },
  name: { type: String, required: true },
  durationDays: { type: Number, required: true },
  price: { type: Number, required: true },
  features: [{ type: String }],
  videoUrl: { type: String, default: '' }, // YouTube video URL or ID
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

export default mongoose.model<IPackage>('Package', PackageSchema);
