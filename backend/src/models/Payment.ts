import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  subscription: mongoose.Types.ObjectId;
  amount: number;
  method: 'bkash' | 'google_play';
  transactionId?: string;
  paymentID?: string;
  invoiceNumber?: string;
  status: 'pending' | 'completed' | 'failed';
  promoCode?: string;
  discountAmount: number;
  finalAmount: number;
  packageType: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['bkash', 'google_play'],
    required: true
  },
  transactionId: { type: String },
  paymentID: { type: String },
  invoiceNumber: { type: String },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  promoCode: { type: String },
  discountAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  packageType: { type: String }
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
