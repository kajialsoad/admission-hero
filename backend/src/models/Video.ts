import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  url: string;
  university?: mongoose.Types.ObjectId;
  unit?: string;
  isPremium?: boolean;
  viewCount?: number;
}

const VideoSchema = new Schema({
  title: { type: String },
  url: { type: String, required: true },
  university: { type: Schema.Types.ObjectId, ref: 'University' },
  unit: { type: String },
  isPremium: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IVideo>('Video', VideoSchema);
