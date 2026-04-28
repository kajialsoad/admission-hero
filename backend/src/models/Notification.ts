import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  body?: string; // For Firebase compatibility
  type: 'exam' | 'payment' | 'system' | 'chat' | 'announcement';
  isRead: boolean;
  timestamp: Date;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  
  // Firebase specific fields
  tokens?: string[]; // FCM tokens
  topic?: string; // Firebase topic
  users?: string[]; // Target users
  sentAt?: Date;
  sentBy?: string;
}

const NotificationSchema: Schema = new Schema({
  userId: {
    type: String,
    required: false, // Made optional for Firebase notifications
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: false, // Made optional for Firebase notifications
  },
  body: {
    type: String, // Firebase compatibility
  },
  type: {
    type: String,
    enum: ['exam', 'payment', 'system', 'chat', 'announcement'],
    default: 'system',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  data: {
    type: Schema.Types.Mixed,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  expiresAt: {
    type: Date,
  },
  
  // Firebase specific fields
  tokens: [{
    type: String,
  }],
  topic: {
    type: String,
  },
  users: [{
    type: String,
  }],
  sentAt: {
    type: Date,
  },
  sentBy: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
NotificationSchema.index({ userId: 1, timestamp: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<INotification>('Notification', NotificationSchema);