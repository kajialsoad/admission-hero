import mongoose, { Schema, Document } from 'mongoose';

export interface IAppContent extends Document {
  key: string; // 'about_app', 'privacy_policy', 'terms_conditions', 'refund_policy', 'contact_us', 'support_info', 'faq'
  title: string;
  content: string; // Rich text HTML content
  status: 'draft' | 'published';
  lastUpdatedBy?: string; // Admin user ID
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const AppContentSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    enum: ['about_app', 'privacy_policy', 'terms_conditions', 'refund_policy', 'contact_us', 'support_info', 'faq', 'version_notes'],
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
  },
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  version: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

// Increment version on update
AppContentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.version += 1;
  }
  next();
});

export default mongoose.model<IAppContent>('AppContent', AppContentSchema);
