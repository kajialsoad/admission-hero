import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversity extends Document {
  name: string;
  shortName?: string;
  logo?: string;
  units: string[]; // ["A", "B", "C", "D"]
}

const UniversitySchema = new Schema({
  name: { type: String, required: true, unique: true },
  shortName: { type: String },
  logo: { type: String },
  units: { type: [String], default: [] } // Array of strings: ["A", "B", "C", "D"]
}, { timestamps: true });

export default mongoose.model<IUniversity>('University', UniversitySchema);