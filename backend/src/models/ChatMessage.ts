import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  _id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'admin' | 'system';
  message: string;
  messageType: 'text' | 'image' | 'file';
  timestamp: Date;
  isRead: boolean;
  conversationId: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
  };
}

const ChatMessageSchema: Schema = new Schema({
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  senderType: {
    type: String,
    enum: ['user', 'admin', 'system'],
    default: 'user',
  },
  message: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  conversationId: {
    type: String,
    required: true,
  },
  metadata: {
    fileName: String,
    fileSize: Number,
    imageUrl: String,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
ChatMessageSchema.index({ conversationId: 1, timestamp: -1 });
ChatMessageSchema.index({ senderId: 1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);