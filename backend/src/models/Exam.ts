import mongoose, { Schema, Document } from 'mongoose';

export interface IExam extends Document {
  title: string;
  description?: string;
  university?: mongoose.Types.ObjectId;
  unit?: string;
  duration?: number;
  totalMarks?: number;
  status?: 'live'|'draft'|'disabled';
  questionsCount?: number;
}

const ExamSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  university: { type: Schema.Types.ObjectId, ref: 'University' },
  unit: { type: String },
  duration: { type: Number, default: 60 },
  totalMarks: { type: Number, default: 100 },
  status: { type: String, enum: ['live','draft','disabled'], default: 'draft' },
  questionsCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IExam>('Exam', ExamSchema);
