import mongoose, { Schema, type Document } from "mongoose"

export interface IQuestion extends Document {
  questionSetId: mongoose.Types.ObjectId
  university: mongoose.Types.ObjectId
  unit: string
  session: string
  questionNumber: number
  text: string
  questionType: "mcq"
  options: {
    key: string
    text: string
  }[]
  correctAnswer: string
  explanations: {
    title: string
    content: string
  }[]
  createdAt: Date
  updatedAt: Date
}

const QuestionSchema = new Schema(
  {
    questionSetId: { 
      type: Schema.Types.ObjectId, 
      ref: "QuestionSet", 
      required: true 
    },
    university: { 
      type: Schema.Types.ObjectId, 
      ref: "University", 
      required: true 
    },
    unit: { 
      type: String, 
      required: true 
    },
    session: { 
      type: String, 
      required: true 
    },
    questionNumber: { 
      type: Number, 
      required: true 
    },
    text: { 
      type: String, 
      required: true 
    },
    questionType: { 
      type: String, 
      enum: ["mcq"], 
      default: "mcq" 
    },
    options: [
      {
        key: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    correctAnswer: { 
      type: String, 
      required: true 
    },
    explanations: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
)

// Index for faster queries
QuestionSchema.index({ questionSetId: 1, questionNumber: 1 })

export default mongoose.model<IQuestion>("Question", QuestionSchema)