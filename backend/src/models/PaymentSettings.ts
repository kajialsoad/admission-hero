import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentSettings extends Document {
  bkashEnabled: boolean;
  googlePlayEnabled: boolean;
  bkashConfig?: {
    username?: string;
    password?: string;
    appKey?: string;
    appSecret?: string;
    baseUrl?: string;
  };
  googlePlayConfig?: {
    packageName?: string;
    serviceAccountEmail?: string;
    serviceAccountKey?: string;
    productIds?: string[];
  };
  subscriptionVideoUrl?: string;
  subscriptionDescription?: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSettingsSchema = new Schema({
  bkashEnabled: {
    type: Boolean,
    default: true
  },
  googlePlayEnabled: {
    type: Boolean,
    default: false
  },
  bkashConfig: {
    username: String,
    password: String,
    appKey: String,
    appSecret: String,
    baseUrl: String
  },
  googlePlayConfig: {
    packageName: String,
    serviceAccountEmail: String,
    serviceAccountKey: String,
    productIds: [String]
  },
  subscriptionVideoUrl: {
    type: String,
    default: ''
  },
  subscriptionDescription: {
    type: String,
    default: 'এই প্রিমিয়াম সাবস্ক্রিপশনে আপনি পাবেন সব ফিচার।'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export default mongoose.model<IPaymentSettings>('PaymentSettings', PaymentSettingsSchema);
