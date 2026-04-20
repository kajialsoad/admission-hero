import mongoose, { Schema, Document } from 'mongoose';

export interface IExamResult extends Document {
  userId: mongoose.Types.ObjectId;
  questionSetId: mongoose.Types.ObjectId | string;
  questionSetName?: string;
  totalQuestions: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattempted: number;
  answers: Array<{
    questionId: string;
    selected: string | null;
    correct: string | null;
    isCorrect: boolean;
  }>;
  timeTaken: number;
  submittedAt: Date;
}

const ExamResultSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questionSetId: { type: Schema.Types.ObjectId, ref: 'QuestionSet', required: true },
    questionSetName: { type: String },
    totalQuestions: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    unattempted: { type: Number, default: 0 },
    answers: [
      {
        questionId: String,
        selected: String,
        correct: String,
        isCorrect: Boolean,
      },
    ],
    timeTaken: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IExamResult>('ExamResult', ExamResultSchema);
