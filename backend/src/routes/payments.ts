// routes/paymentRoutes.ts
import express from "express"
import { 
  createBKashPayment, 
  handleBKashCallback, 
  verifyBKashPayment,
  verifyGooglePlayPurchase,
  fixPaidUsersExpiry
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

// ============ Admin/Migration Routes ============
// Fix Premium users without expiry date (PUBLIC for now - should be admin only in production)
router.get("/fix-Premium-users-expiry", fixPaidUsersExpiry)
router.post("/fix-Premium-users-expiry", fixPaidUsersExpiry)

export default router
