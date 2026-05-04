import { Router } from "express"
import {
  getQuestionSets,
  getAvailableSessions,
  createQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
  getQuestionsBySetId,
  addQuestionsToSet,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController"

const router = Router()

// Question Set routes
router.get("/sets/all", getQuestionSets)
router.get("/sessions/available", getAvailableSessions)
router.post("/sets", createQuestionSet)
router.put("/sets/:id", updateQuestionSet)
router.delete("/sets/:id", deleteQuestionSet)
router.get("/sets/:setId/questions", getQuestionsBySetId)

// Individual Question routes
router.post("/sets/:setId/questions", addQuestionsToSet) // Add questions to existing set
router.put("/:questionId", updateQuestion) // Update individual question
router.delete("/:questionId", deleteQuestion) // Delete individual question

export default router