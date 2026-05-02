import axios from 'axios';
import { google } from 'googleapis';

interface GooglePlayConfig {
  packageName: string;
  serviceAccountKey: any;
}

class GooglePlayService {
  private androidPublisher: any;
  private packageName: string;

  constructor(config: GooglePlayConfig) {
    this.packageName = config.packageName;
    
    // Initialize Google Play Developer API
    const auth = new google.auth.GoogleAuth({
      credentials: config.serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    this.androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: auth,
    });
  }

  /**
   * Verify a subscription purchase
   */
  async verifySubscription(productId: string, purchaseToken: string) {
    try {
      console.log('[GooglePlay] Verifying subscription:', { productId, purchaseToken });

      const response = await this.androidPublisher.purchases.subscriptions.get({
        packageName: this.packageName,
        subscriptionId: productId,
        token: purchaseToken,
      });

      const purchase = response.data;
      console.log('[GooglePlay] Subscription verified:', purchase);

      // Check if subscription is valid
      const isValid = 
        purchase.paymentState === 1 && // Payment received
        purchase.expiryTimeMillis && 
        parseInt(purchase.expiryTimeMillis) > Date.now();

      return {
        valid: isValid,
        orderId: purchase.orderId,
        purchaseTimeMillis: purchase.startTimeMillis,
        expiryTimeMillis: purchase.expiryTimeMillis,
        autoRenewing: purchase.autoRenewing,
        priceCurrencyCode: purchase.priceCurrencyCode,
        priceAmountMicros: purchase.priceAmountMicros,
        countryCode: purchase.countryCode,
        paymentState: purchase.paymentState,
        cancelReason: purchase.cancelReason,
      };
    } catch (error: any) {
      console.error('[GooglePlay] Verification error:', error.message);
      throw new Error(`Failed to verify subscription: ${error.message}`);
    }
  }

  /**
   * Verify a one-time product purchase
   */
  async verifyProduct(productId: string, purchaseToken: string) {
    try {
      console.log('[GooglePlay] Verifying product:', { productId, purchaseToken });

      const response = await this.androidPublisher.purchases.products.get({
        packageName: this.packageName,
        productId: productId,
        token: purchaseToken,
      });

      const purchase = response.data;
      console.log('[GooglePlay] Product verified:', purchase);

      // Check if purchase is valid
      const isValid = purchase.purchaseState === 0; // 0 = Purchased, 1 = Canceled

      return {
        valid: isValid,
        orderId: purchase.orderId,
        purchaseTimeMillis: purchase.purchaseTimeMillis,
        purchaseState: purchase.purchaseState,
        consumptionState: purchase.consumptionState,
        developerPayload: purchase.developerPayload,
      };
    } catch (error: any) {
      console.error('[GooglePlay] Verification error:', error.message);
      throw new Error(`Failed to verify product: ${error.message}`);
    }
  }

  /**
   * Acknowledge a purchase (required for non-consumable products)
   */
  async acknowledgePurchase(productId: string, purchaseToken: string) {
    try {
      await this.androidPublisher.purchases.products.acknowledge({
        packageName: this.packageName,
        productId: productId,
        token: purchaseToken,
      });
      console.log('[GooglePlay] Purchase acknowledged');
      return true;
    } catch (error: any) {
      console.error('[GooglePlay] Acknowledge error:', error.message);
      return false;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, purchaseToken: string) {
    try {
      await this.androidPublisher.purchases.subscriptions.cancel({
        packageName: this.packageName,
        subscriptionId: subscriptionId,
        token: purchaseToken,
      });
      console.log('[GooglePlay] Subscription canceled');
      return true;
    } catch (error: any) {
      console.error('[GooglePlay] Cancel error:', error.message);
      return false;
    }
  }
}

// Initialize with environment variables or database config
let googlePlayService: GooglePlayService | null = null;

export const initializeGooglePlayService = (config: GooglePlayConfig) => {
  googlePlayService = new GooglePlayService(config);
  return googlePlayService;
};

export const getGooglePlayService = (): GooglePlayService => {
  if (!googlePlayService) {
    throw new Error('Google Play Service not initialized');
  }
  return googlePlayService;
};

export default GooglePlayService;
