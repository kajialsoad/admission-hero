import mongoose, { Schema, Document } from 'mongoose';

export interface IAppStatistics extends Document {
  totalExams: number;
  totalQuestions: number;
  totalVideos: number;
  lastUpdatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const AppStatisticsSchema: Schema = new Schema({
  totalExams: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  totalQuestions: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  totalVideos: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

export default mongoose.model<IAppStatistics>('AppStatistics', AppStatisticsSchema);
