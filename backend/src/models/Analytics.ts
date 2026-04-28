import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  _id: string;
  userId?: string;
  eventType: 'login' | 'exam_start' | 'exam_complete' | 'payment' | 'video_watch' | 'page_view';
  eventData: any;
  timestamp: Date;
  sessionId?: string;
  deviceInfo?: {
    platform: string;
    version: string;
    model?: string;
  };
  location?: {
    country?: string;
    city?: string;
  };
}

const AnalyticsSchema: Schema = new Schema({
  userId: {
    type: String,
  },
  eventType: {
    type: String,
    enum: ['login', 'exam_start', 'exam_complete', 'payment', 'video_watch', 'page_view'],
    required: true,
  },
  eventData: {
    type: Schema.Types.Mixed,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  sessionId: {
    type: String,
  },
  deviceInfo: {
    platform: String,
    version: String,
    model: String,
  },
  location: {
    country: String,
    city: String,
  },
}, {
  timestamps: true,
});

// Indexes for analytics queries
AnalyticsSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsSchema.index({ userId: 1, timestamp: -1 });
AnalyticsSchema.index({ timestamp: -1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);