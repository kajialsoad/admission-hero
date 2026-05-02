// controllers/paymentController.ts
import type { Request, Response } from "express"
import Subscription from "../models/Subscription"
import Payment from "../models/Payment"
import Package from "../models/Package"
import PromoCode from "../models/PromoCode"
import User from "../models/User"
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

    const { packageType, promoCode, payerReference } = req.body;

    console.log("Payment data received:", { packageType, promoCode });

    if (!packageType) {
      return res.status(400).json({ success: false, message: "Missing required field: packageType" });
    }

    // Get package details
    const pkg = await Package.findOne({ type: packageType, status: 'active' });
    
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    let finalAmount = pkg.price;
    let discountAmount = 0;
    let promoCodeUsed = null;

    // Apply promo code if provided
    if (promoCode) {
      const promo = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        status: 'active'
      });

      if (promo && new Date() <= promo.expiryDate && promo.usedCount < promo.usageLimit) {
        if (promo.discountType === 'percentage') {
          discountAmount = (pkg.price * promo.discountValue) / 100;
        } else {
          discountAmount = promo.discountValue;
        }
        finalAmount = Math.max(0, pkg.price - discountAmount);
        promoCodeUsed = promo.code;
      }
    }

    if (finalAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount after discount" });
    }

    // Invoice & Callback
    const merchantInvoiceNumber = `INV-${userId}-${Date.now()}`;
    const callbackURL = `${DEFAULT_BACKEND}/api/payments/bkash/callback`;

    console.log("Creating bKash payment:", { userId, packageType, finalAmount, merchantInvoiceNumber, callbackURL });

    const {
      bkashURL,
      paymentID,
      callbackURL: returnedCallbackURL,
    } = await bkashService.createPayment({
      amount: String(finalAmount),
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
      packageName: pkg.name,
      paymentMethod: "bkash",
      active: false,
      paymentID,
      invoiceNumber: merchantInvoiceNumber,
      amount: finalAmount,
      duration: pkg.durationDays,
      planId: packageType,
    });

    await pendingSubscription.save();

    // Save payment record
    const payment = new Payment({
      user: userId,
      subscription: pendingSubscription._id,
      amount: pkg.price,
      method: 'bkash',
      paymentID,
      invoiceNumber: merchantInvoiceNumber,
      status: 'pending',
      promoCode: promoCodeUsed,
      discountAmount,
      finalAmount,
      packageType
    });

    await payment.save();

    console.log("Subscription and payment saved:", pendingSubscription._id, payment._id);

    return res.status(200).json({
      success: true,
      paymentURL: bkashURL,
      paymentID,
      invoiceNumber: merchantInvoiceNumber,
      callbackURL: returnedCallbackURL || callbackURL,
      amount: finalAmount,
      discount: discountAmount
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

    const paymentID =
      (req.query.paymentID ||
        req.query.paymentId ||
        req.query.payment_id ||
        req.body.paymentID ||
        req.body.paymentId ||
        req.body.payment_id) as string

    const status = (req.query.status || req.body.status || "").toLowerCase();

    console.log("Extracted --->", { paymentID, status })

    if (status && status.toLowerCase() !== "success") {
      // Update payment status to failed
      await Payment.updateOne({ paymentID }, { status: 'failed' });
      return res.redirect(`${DEFAULT_FRONTEND}/(tabs)/subscription?status=failed&reason=user_cancelled`)
    }

    if (!paymentID) {
      return res.redirect(`${DEFAULT_FRONTEND}/(tabs)/subscription?status=failed&reason=missing_payment_id`)
    }

    const executeResponse: any = await bkashService.executePayment(paymentID)
    console.log("Execute API Response:", executeResponse)

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
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { new: true }
    )

    if (!subscription) {
      await Payment.updateOne({ paymentID }, { status: 'failed' });
      return res.redirect(
        `${DEFAULT_FRONTEND}/(tabs)/subscription?status=failed&reason=subscription_not_found`
      )
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { paymentID },
      {
        status: 'completed',
        transactionId
      },
      { new: true }
    );

    // Increment promo code usage if used
    if (payment && payment.promoCode) {
      await PromoCode.updateOne(
        { code: payment.promoCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // Update user subscription status
    await User.findByIdAndUpdate(subscription.user, {
      subscriptionStatus: 'paid',
      subscriptionType: subscription.duration === 90 ? '3-month' : subscription.duration === 180 ? '6-month' : '12-month',
      subscriptionExpireAt: subscription.expireAt
    })

    console.log("Subscription Activated and User Updated:", subscription._id)

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


// ============ Google Play Billing ============

export const verifyGooglePlayPurchase = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - No user found" 
      });
    }

    const { 
      productId, 
      purchaseToken, 
      packageType,
      orderId 
    } = req.body;

    console.log("[GooglePlay] Verification request:", { 
      userId, 
      productId, 
      packageType,
      orderId 
    });

    // Validate required fields
    if (!productId || !purchaseToken || !packageType) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: productId, purchaseToken, packageType" 
      });
    }

    // Get package details
    const pkg = await Package.findOne({ type: packageType, status: 'active' });
    
    if (!pkg) {
      return res.status(404).json({ 
        success: false, 
        message: "Package not found" 
      });
    }

    // TODO: Verify purchase with Google Play API
    // For now, we'll create a basic implementation
    // In production, you should verify with Google Play Developer API
    
    console.log("[GooglePlay] Creating subscription for user:", userId);

    // Calculate expiry date
    const now = new Date();
    let expireAt = new Date(now);
    
    if (packageType === 'monthly') {
      expireAt.setMonth(expireAt.getMonth() + 1);
    } else if (packageType === 'yearly') {
      expireAt.setFullYear(expireAt.getFullYear() + 1);
    }

    // Create or update subscription
    let subscription = await Subscription.findOne({ user: userId });

    if (subscription) {
      // Update existing subscription
      subscription.packageName = pkg.name;
      subscription.active = true;
      subscription.paymentMethod = 'google_play';
      subscription.expireAt = expireAt;
      subscription.duration = pkg.durationDays;
      subscription.planId = packageType;
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await Subscription.create({
        user: userId,
        packageName: pkg.name,
        paymentMethod: 'google_play',
        active: true,
        expireAt: expireAt,
        duration: pkg.durationDays,
        planId: packageType,
        transactionID: orderId || purchaseToken
      });
    }

    // Create payment record
    const payment = await Payment.create({
      user: userId,
      subscription: subscription._id,
      amount: pkg.price,
      method: 'google_play',
      transactionId: orderId || purchaseToken,
      status: 'completed',
      finalAmount: pkg.price,
      packageType: packageType,
      invoiceNumber: `GP-${userId}-${Date.now()}`
    });

    // Update user subscription status
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'paid',
      subscriptionType: packageType,
      subscriptionExpireAt: expireAt
    });

    console.log("[GooglePlay] Subscription created successfully");

    res.json({
      success: true,
      message: 'Google Play purchase verified successfully',
      subscription: {
        id: subscription._id,
        active: subscription.active,
        expireAt: subscription.expireAt,
        packageName: pkg.name
      },
      payment: {
        id: payment._id,
        amount: payment.amount,
        transactionId: payment.transactionId,
        status: payment.status
      }
    });

  } catch (error: any) {
    console.error("[GooglePlay] Verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify Google Play purchase'
    });
  }
};
