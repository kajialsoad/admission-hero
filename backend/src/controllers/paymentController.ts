// controllers/paymentController.ts
import type { Request, Response } from "express"
import Subscription from "../models/Subscription"
import { bkashService } from "../utils/bkash"

const DEFAULT_FRONTEND = process.env.FRONTEND_URL || "http://localhost:8081"
const DEFAULT_BACKEND = process.env.BACKEND_URL || "http://localhost:5000"

// Create payment for subscription
export const createBKashPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    console.log("Payment creation request - User ID:", userId);

    if (!userId) {
      console.error("No user ID in authenticated request");
      return res.status(401).json({ success: false, message: "Unauthorized - No user found" });
    }

    const { planId, planName, amount, duration, payerReference } = req.body;

    console.log("Payment data received:", { planId, amount, planName, duration });

    if (!amount || !planId) {
      return res.status(400).json({ success: false, message: "Missing required fields: amount, planId" });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
    }

    // Invoice & Callback
    const merchantInvoiceNumber = `INV-${userId}-${Date.now()}`;
    const callbackURL = `${DEFAULT_BACKEND}/api/payments/bkash/callback`;

    console.log("Creating bKash payment:", { userId, planId, amount, merchantInvoiceNumber, callbackURL });

    // ⭐ FIXED HERE — renamed paymentURL → bkashURL
    const {
      bkashURL,
      paymentID,
      callbackURL: returnedCallbackURL,
    } = await bkashService.createPayment({
      amount: String(amount),
      merchantInvoiceNumber,
      callbackURL,
      payerReference: payerReference || "01770618575",
      merchantAssociationInfo: "MI05MID54RF09123456One",
    });

    if (!bkashURL || !paymentID) {
      console.error("bKash createPayment returned incomplete data", { bkashURL, paymentID });
      return res.status(502).json({ success: false, message: "Failed to initiate bKash payment" });
    }

    // Save pending subscription
    const pendingSubscription = new Subscription({
      user: userId,
      packageName: planName || "Standard Plan",
      paymentMethod: "bkash",
      active: false,
      paymentID,
      invoiceNumber: merchantInvoiceNumber,
      amount,
      duration: duration || 1,
      planId,
    });

    await pendingSubscription.save();

    console.log("Subscription saved:", pendingSubscription._id);

    return res.status(200).json({
      success: true,
      paymentURL: bkashURL,  // ⭐ FRONTEND COMPATIBILITY KEPT SAME NAME
      paymentID,
      invoiceNumber: merchantInvoiceNumber,
      callbackURL: returnedCallbackURL || callbackURL,
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create payment" });
  }
};

// Handle payment callback (PUBLIC - bKash will call this)
export const handleBKashCallback = async (req: Request, res: Response) => {
  try {
    console.log("------ bKash Callback Received ------")
    console.log("Query:", req.query)
    console.log("Body:", req.body)

    // Read from query or POST body (fallback)
    const paymentID =
      (req.query.paymentID ||
        req.query.paymentId ||
        req.query.payment_id ||
        req.body.paymentID ||
        req.body.paymentId ||
        req.body.payment_id) as string

    const status = (req.query.status || req.body.status || "").toLowerCase();

    console.log("Extracted --->", { paymentID, status })

    // If user clicked cancel/failure on bkash UI
    if (status && status.toLowerCase() !== "success") {
      return res.redirect(`${DEFAULT_FRONTEND}/(tabs)/subscription?status=failed&reason=user_cancelled`)
    }

    if (!paymentID) {
      return res.redirect(`${DEFAULT_FRONTEND}/(tabs)/subscription?status=failed&reason=missing_payment_id`)
    }

    // ------------------------------------------------------
    // 🔥 This is the correct official step: EXECUTE PAYMENT
    // ------------------------------------------------------
    const executeResponse: any = await bkashService.executePayment(paymentID)

    console.log("Execute API Response:", executeResponse)

    // Extract transaction ID from execute response
    const transactionId =
      executeResponse.trxID ||
      executeResponse.transactionId ||
      executeResponse.transactionID ||
      ""

    // Update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { paymentID },
      {
        active: true,
        transactionID: transactionId,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      { new: true }
    )

    if (!subscription) {
      return res.redirect(
        `${DEFAULT_FRONTEND}/(tabs)/subscription?status=failed&reason=subscription_not_found`
      )
    }

    // ✅ UPDATE USER SUBSCRIPTION STATUS
    const User = require('../models/User').default
    await User.findByIdAndUpdate(subscription.user, {
      subscriptionStatus: 'paid',
      subscriptionType: subscription.duration === 1 ? '1-month' : subscription.duration === 3 ? '3-month' : '6-month',
      subscriptionExpireAt: subscription.expireAt
    })

    console.log("Subscription Activated and User Updated:", subscription._id)

    // Redirect user to success screen
    return res.redirect(
      `${DEFAULT_FRONTEND}/(tabs)/subscription?status=success&transactionId=${transactionId}`
    )
  } catch (error) {
    console.error("Callback Error:", error)
    return res.redirect(`${DEFAULT_FRONTEND}/(tabs)/subscription?status=failed&reason=server_error`)
  }
}



// Verify and execute payment (called by your client after return from bKash)
export const verifyBKashPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id
    const { paymentID } = req.body

    console.log("Verify payment request:", { userId, paymentID })

    if (!userId) {
      console.error("No user ID in payment verification")
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    if (!paymentID) {
      console.error("Payment ID missing in verification request")
      return res.status(400).json({ success: false, message: "Missing required fields: paymentID" })
    }

    console.log("Verifying payment:", { userId, paymentID })

    // Execute payment
    const execResult: any = await bkashService.executePayment(String(paymentID))
    const transactionID = execResult?.trxID || execResult?.transactionId || execResult?.transactionID
    const status = execResult?.status || execResult?.result
    const statusMessage = execResult?.statusMessage || execResult?.message

    console.log("Execute payment result:", { status, statusMessage, transactionID, execResult })

    if (!status || status.toLowerCase() !== "success") {
      console.error("Payment execution failed:", statusMessage)
      return res.status(400).json({
        success: false,
        message: "Payment execution failed",
        statusMessage,
      })
    }

    // Update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { paymentID, user: userId },
      {
        active: true,
        transactionID,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { new: true },
    )

    if (!subscription) {
      console.error("Subscription not found for user and payment ID")
      return res.status(404).json({ success: false, message: "Subscription not found" })
    }

    // ✅ UPDATE USER SUBSCRIPTION STATUS
    const User = require('../models/User').default
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'paid',
      subscriptionType: subscription.duration === 1 ? '1-month' : subscription.duration === 3 ? '3-month' : '6-month',
      subscriptionExpireAt: subscription.expireAt
    })

    console.log("Payment verified successfully and user updated:", transactionID)

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      subscription,
      transactionID,
    })
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return res.status(500).json({ success: false, message: error.message || "Failed to verify payment" })
  }
}
