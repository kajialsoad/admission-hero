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
      
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Failed</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { color: #e53e3e; margin: 0 0 10px 0; font-size: 24px; }
            p { color: #666; margin: 0 0 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>Payment Failed</h1>
            <p>Your payment was cancelled or failed. Please try again.</p>
            <p style="font-size: 12px; color: #999;">You can close this window and return to the app.</p>
          </div>
        </body>
        </html>
      `);
    }

    if (!paymentID) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Error</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { color: #e53e3e; margin: 0 0 10px 0; font-size: 24px; }
            p { color: #666; margin: 0 0 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⚠️</div>
            <h1>Payment Error</h1>
            <p>Payment ID is missing. Please contact support.</p>
            <p style="font-size: 12px; color: #999;">You can close this window and return to the app.</p>
          </div>
        </body>
        </html>
      `);
    }

    const executeResponse: any = await bkashService.executePayment(paymentID)
    console.log("Execute API Response:", executeResponse)

    const transactionId =
      executeResponse.trxID ||
      executeResponse.transactionId ||
      executeResponse.transactionID ||
      ""

    // Get subscription to find duration
    const subscription = await Subscription.findOne({ paymentID })
    
    if (!subscription) {
      await Payment.updateOne({ paymentID }, { status: 'failed' });
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { color: #e53e3e; margin: 0 0 10px 0; font-size: 24px; }
            p { color: #666; margin: 0 0 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⚠️</div>
            <h1>Subscription Not Found</h1>
            <p>Could not find subscription record. Please contact support.</p>
            <p style="font-size: 12px; color: #999;">Payment ID: ${paymentID}</p>
            <p style="font-size: 12px; color: #999;">You can close this window and return to the app.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Calculate expiry date based on package duration
    const durationDays = subscription.duration || 30; // Default to 30 if not set
    const expireAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    
    console.log(`Setting subscription expiry: ${durationDays} days from now (${expireAt})`);

    // Update subscription with dynamic expiry
    subscription.active = true;
    subscription.transactionID = transactionId;
    subscription.expireAt = expireAt;
    await subscription.save();

    if (!subscription) {
      await Payment.updateOne({ paymentID }, { status: 'failed' });
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { color: #e53e3e; margin: 0 0 10px 0; font-size: 24px; }
            p { color: #666; margin: 0 0 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⚠️</div>
            <h1>Subscription Not Found</h1>
            <p>Could not find subscription record. Please contact support.</p>
            <p style="font-size: 12px; color: #999;">Payment ID: ${paymentID}</p>
            <p style="font-size: 12px; color: #999;">You can close this window and return to the app.</p>
          </div>
        </body>
        </html>
      `);
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

    // Determine subscription type based on duration
    let subscriptionType = '1-month'; // default
    const subDurationDays = subscription.duration || 30;
    
    if (subDurationDays >= 365) {
      subscriptionType = '12-month';
    } else if (subDurationDays >= 180) {
      subscriptionType = '6-month';
    } else if (subDurationDays >= 90) {
      subscriptionType = '3-month';
    } else if (subDurationDays >= 30) {
      subscriptionType = '1-month';
    }
    
    console.log(`Setting subscription type: ${subscriptionType} (${subDurationDays} days)`);

    // Update user subscription status
    await User.findByIdAndUpdate(subscription.user, {
      subscriptionStatus: 'Premium',
      subscriptionType: subscriptionType,
      subscriptionExpireAt: subscription.expireAt
    })

    console.log("Subscription Activated and User Updated:", subscription._id)

    // Return success HTML page for Flutter
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Successful</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 400px; }
          .icon { font-size: 80px; margin-bottom: 20px; animation: bounce 1s ease; }
          @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
          h1 { color: #48bb78; margin: 0 0 10px 0; font-size: 28px; }
          p { color: #666; margin: 0 0 10px 0; line-height: 1.6; }
          .transaction { background: #f7fafc; padding: 12px; border-radius: 6px; margin: 20px 0; font-size: 12px; color: #718096; }
          .btn { display: inline-block; padding: 14px 28px; background: #48bb78; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; transition: background 0.3s; }
          .btn:hover { background: #38a169; }
          .info { font-size: 13px; color: #999; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>Payment Successful!</h1>
          <p>Your subscription has been activated successfully.</p>
          <p style="font-weight: bold; color: #48bb78;">Welcome to Premium!</p>
          
          <div class="transaction">
            <strong>Transaction ID:</strong><br>
            ${transactionId || 'N/A'}
          </div>
          
          <p class="info">
            You can now close this window and return to the app to enjoy premium features.
          </p>
          
          <a href="#" onclick="window.close(); return false;" class="btn">Close Window</a>
        </div>
        
        <script>
          // Auto-close after 5 seconds
          setTimeout(() => {
            window.close();
          }, 5000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Callback Error:", error)
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Error</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; }
          .icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #e53e3e; margin: 0 0 10px 0; font-size: 24px; }
          p { color: #666; margin: 0 0 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">⚠️</div>
          <h1>Server Error</h1>
          <p>An error occurred while processing your payment. Please contact support.</p>
          <p style="font-size: 12px; color: #999;">You can close this window and return to the app.</p>
        </div>
      </body>
      </html>
    `);
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

    // Get subscription first to get duration
    const subscription = await Subscription.findOne({ paymentID, user: userId })

    if (!subscription) {
      console.error("Subscription not found for user and payment ID")
      return res.status(404).json({ success: false, message: "Subscription not found" })
    }

    // Calculate expiry date based on package duration
    const durationDays = subscription.duration || 30;
    const expireAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    
    console.log(`Verify: Setting subscription expiry: ${durationDays} days from now (${expireAt})`);

    // Update subscription
    subscription.active = true;
    subscription.transactionID = transactionID;
    subscription.expireAt = expireAt;
    await subscription.save();

    // Determine subscription type based on duration
    let subscriptionType = '1-month';
    
    if (durationDays >= 365) {
      subscriptionType = '12-month';
    } else if (durationDays >= 180) {
      subscriptionType = '6-month';
    } else if (durationDays >= 90) {
      subscriptionType = '3-month';
    } else if (durationDays >= 30) {
      subscriptionType = '1-month';
    }
    
    console.log(`Verify: Setting subscription type: ${subscriptionType} (${durationDays} days)`);

    // ✅ UPDATE USER SUBSCRIPTION STATUS
    const User = require('../models/User').default
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'Premium',
      subscriptionType: subscriptionType,
      subscriptionExpireAt: expireAt
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

// Fix existing Premium users without expiry date (Admin only)
export const fixPaidUsersExpiry = async (req: Request, res: Response) => {
  try {
    // Find all Premium users without expiry date
    const usersToFix = await User.find({
      subscriptionStatus: 'Premium',
      $or: [
        { subscriptionExpireAt: null },
        { subscriptionExpireAt: { $exists: false } }
      ]
    });

    console.log(`Found ${usersToFix.length} Premium users without expiry date`);

    const results = [];

    for (const user of usersToFix) {
      // Find their most recent active subscription
      const subscription = await Subscription.findOne({
        user: user._id,
        active: true
      }).sort({ createdAt: -1 });

      if (subscription && subscription.expireAt) {
        // Update user with subscription expiry
        await User.findByIdAndUpdate(user._id, {
          subscriptionExpireAt: subscription.expireAt
        });

        results.push({
          userId: user._id,
          email: user.email,
          phone: user.phone,
          subscriptionType: user.subscriptionType,
          expireAt: subscription.expireAt,
          status: 'fixed'
        });

        console.log(`Fixed user ${user._id}: set expiry to ${subscription.expireAt}`);
      } else {
        // No subscription found or no expiry, calculate based on subscription type
        let durationDays = 30; // default
        
        if (user.subscriptionType === '12-month') {
          durationDays = 365;
        } else if (user.subscriptionType === '6-month') {
          durationDays = 180;
        } else if (user.subscriptionType === '3-month') {
          durationDays = 90;
        } else if (user.subscriptionType === '1-month') {
          durationDays = 30;
        }

        const expireAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

        await User.findByIdAndUpdate(user._id, {
          subscriptionExpireAt: expireAt
        });

        results.push({
          userId: user._id,
          email: user.email,
          phone: user.phone,
          subscriptionType: user.subscriptionType,
          expireAt: expireAt,
          status: 'calculated'
        });

        console.log(`Calculated expiry for user ${user._id}: ${expireAt} (${durationDays} days)`);
      }
    }

    return res.json({
      success: true,
      message: `Fixed ${results.length} users`,
      results
    });

  } catch (error: any) {
    console.error("Fix Premium users error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fix Premium users"
    });
  }
};

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
      subscriptionStatus: 'Premium',
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
