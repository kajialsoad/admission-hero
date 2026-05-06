import mongoose, { Schema, type Document } from "mongoose"

export interface IQuestionSet extends Document {
  name: string
  university: mongoose.Types.ObjectId
  unit: string
  session: string
  totalQuestions: number
  videoUrl?: string
  description?: string
  accessType: 'free' | 'Premium' // New field for access control
  createdAt: Date
  updatedAt: Date
}

const QuestionSetSchema = new Schema(
  {
    name: { type: String, required: true },
    university: { type: Schema.Types.ObjectId, ref: "University", required: true },
    unit: { type: String, required: true },
    session: { type: String, required: true },
    totalQuestions: { type: Number, default: 0 },
    videoUrl: { type: String },
    description: { type: String },
    accessType: { type: String, enum: ['free', 'Premium'], default: 'Premium' }, // Default is Premium
  },
  { timestamps: true },
)

export default mongoose.model<IQuestionSet>("QuestionSet", QuestionSetSchema)
