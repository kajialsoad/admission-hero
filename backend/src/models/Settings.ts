import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  value: any;
  category: string;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
  category: {
    type: String,
    default: 'general',
  },
}, {
  timestamps: true,
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
