// routes/paymentRoutes.ts
import express from "express"
import { 
  createBKashPayment, 
  handleBKashCallback, 
  verifyBKashPayment 
} from "../controllers/paymentController"

import { protect } from "../middlewares/auth"

const router = express.Router()

// Create bKash payment (requires authentication)
router.post("/bkash/create", protect, createBKashPayment)

// Verify OR execute payment (requires authentication)
router.post("/bkash/verify", protect, verifyBKashPayment)

// bKash callback (PUBLIC) — DO NOT use protect here
router.get("/bkash/callback", handleBKashCallback)

// router.get("/bkash/callback", (req, res) => {
//   return res.status(200).send("Please use POST for bKash callback")
// })

export default router
