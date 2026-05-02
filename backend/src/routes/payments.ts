// routes/paymentRoutes.ts
import express from "express"
import { 
  createBKashPayment, 
  handleBKashCallback, 
  verifyBKashPayment,
  verifyGooglePlayPurchase
} from "../controllers/paymentController"

import { protect } from "../middlewares/auth"

const router = express.Router()

// ============ bKash Payment Routes ============
// Create bKash payment (requires authentication)
router.post("/bkash/create", protect, createBKashPayment)

// Verify OR execute payment (requires authentication)
router.post("/bkash/verify", protect, verifyBKashPayment)

// bKash callback (PUBLIC) — DO NOT use protect here
router.get("/bkash/callback", handleBKashCallback)

// ============ Google Play Billing Routes ============
// Verify Google Play purchase (requires authentication)
router.post("/google-play/verify", protect, verifyGooglePlayPurchase)

export default router
