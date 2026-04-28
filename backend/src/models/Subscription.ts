// <CHANGE> Added payment-related fields to track bKash transactions
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  packageName: string;
  planId: string;
  startAt: Date;
  expireAt: Date;
  active: boolean;
  paymentMethod?: string;
  paymentID?: string;
  transactionID?: string;
  invoiceNumber?: string;
  amount?: number;
  duration?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const SubscriptionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  packageName: { type: String, required: true },
  planId: { type: String },
  startAt: { type: Date, default: Date.now },
  expireAt: { type: Date },
  active: { type: Boolean, default: false },
  paymentMethod: { type: String },
  paymentID: { type: String },
  transactionID: { type: String },
  invoiceNumber: { type: String },
  amount: { type: Number },
  duration: { type: Number },
}, { timestamps: true });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
