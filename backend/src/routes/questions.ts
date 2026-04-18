import { Router } from "express"
import {
  getQuestionSets,
  createQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
  getQuestionsBySetId,
} from "../controllers/questionController"

const router = Router()

// Question Set routes
router.get("/sets/all", getQuestionSets)
router.post("/sets", createQuestionSet)
router.put("/sets/:id", updateQuestionSet)
router.delete("/sets/:id", deleteQuestionSet)
router.get("/sets/:setId/questions", getQuestionsBySetId)

export default router