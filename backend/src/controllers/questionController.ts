import type { Request, Response } from "express"
import Question from "../models/Question"
import QuestionSet from "../models/QuestionSet"
import University from "../models/University"
import mongoose from "mongoose"

// Get all question sets with filtering
export const getQuestionSets = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const universityId = req.query.universityId as string
    const unit = req.query.unit as string
    const session = req.query.session as string

    const query: any = {}
    if (universityId) query.university = universityId
    if (unit) query.unit = unit
    if (session) query.session = session

    const total = await QuestionSet.countDocuments(query)
    const sets = await QuestionSet.find(query)
      .populate("university", "name shortName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    res.json({
      success: true,
      data: sets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      message: "Question sets retrieved successfully",
    })
  } catch (error: any) {
    console.error("Get question sets error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve question sets",
    })
  }
}

// Create question set with any number of questions
export const createQuestionSet = async (req: Request, res: Response) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { name, university, unit, session: examSession, videoUrl, description, questions } = req.body

    // Validation
    if (!name || !university || !unit || !examSession) {
      await session.abortTransaction()
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, university, unit, session",
      })
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      await session.abortTransaction()
      return res.status(400).json({
        success: false,
        message: "At least one question is required",
      })
    }

    // Check university exists
    const universityExists = await University.findById(university)
    if (!universityExists) {
      await session.abortTransaction()
      return res.status(404).json({
        success: false,
        message: "University not found",
      })
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
        await session.abortTransaction()
        return res.status(400).json({
          success: false,
          message: `Invalid question at position ${i + 1}. Must have text, 4 options, and correct answer`,
        })
      }
      
      // Validate correct answer is A, B, C, or D
      if (!["A", "B", "C", "D"].includes(q.correctAnswer)) {
        await session.abortTransaction()
        return res.status(400).json({
          success: false,
          message: `Invalid correct answer at position ${i + 1}. Must be A, B, C, or D`,
        })
      }
    }

    // Create Question Set
    const questionSet = await QuestionSet.create(
      [
        {
          name: name.trim(),
          university,
          unit,
          session: examSession,
          totalQuestions: questions.length,
          videoUrl: videoUrl?.trim() || undefined,
          description: description?.trim() || undefined,
        },
      ],
      { session }
    )

    // Create all questions
    const questionDocs = questions.map((q: any, index: number) => ({
      questionSetId: questionSet[0]._id,
      university,
      unit,
      session: examSession,
      questionNumber: index + 1,
      text: q.text.trim(),
      questionType: "mcq",
      options: q.options.map((opt: any) => ({
        key: opt.key,
        text: opt.text.trim(),
      })),
      correctAnswer: q.correctAnswer,
      explanations: q.explanation
        ? [{ title: "Explanation", content: q.explanation.trim() }]
        : [],
    }))

    await Question.insertMany(questionDocs, { session })

    await session.commitTransaction()

    res.status(201).json({
      success: true,
      data: questionSet[0],
      message: `Question set with ${questions.length} questions created successfully`,
    })
  } catch (error: any) {
    await session.abortTransaction()
    console.error("Create question set error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create question set",
    })
  } finally {
    session.endSession()
  }
}

// Update question set (only name, video, description)
export const updateQuestionSet = async (req: Request, res: Response) => {
  try {
    const { name, videoUrl, description } = req.body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl?.trim() || undefined
    if (description !== undefined) updateData.description = description?.trim() || undefined

    const set = await QuestionSet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("university", "name shortName")

    if (!set) {
      return res.status(404).json({
        success: false,
        message: "Question set not found",
      })
    }

    res.json({
      success: true,
      data: set,
      message: "Question set updated successfully",
    })
  } catch (error: any) {
    console.error("Update question set error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update question set",
    })
  }
}

// Delete question set and all its questions
export const deleteQuestionSet = async (req: Request, res: Response) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const set = await QuestionSet.findById(req.params.id)

    if (!set) {
      await session.abortTransaction()
      return res.status(404).json({
        success: false,
        message: "Question set not found",
      })
    }

    // Delete all questions in this set
    await Question.deleteMany({ questionSetId: req.params.id }, { session })

    // Delete the question set
    await QuestionSet.findByIdAndDelete(req.params.id, { session })

    await session.commitTransaction()

    res.json({
      success: true,
      message: "Question set and all questions deleted successfully",
    })
  } catch (error: any) {
    await session.abortTransaction()
    console.error("Delete question set error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete question set",
    })
  } finally {
    session.endSession()
  }
}

// Get questions by question set ID
export const getQuestionsBySetId = async (req: Request, res: Response) => {
  try {
    const questions = await Question.find({ questionSetId: req.params.setId })
      .sort({ questionNumber: 1 })

    res.json({
      success: true,
      data: questions,
      message: "Questions retrieved successfully",
    })
  } catch (error: any) {
    console.error("Get questions by set error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve questions",
    })
  }
}