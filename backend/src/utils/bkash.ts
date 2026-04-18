// services/bkashService.ts
import axios from "axios";

interface BKashConfig {
  baseUrl: string;
  username: string;
  password: string;
  appKey: string;
  appSecret: string;
}

class BKashService {
  private config: BKashConfig;
  private tokenCache: { token: string; expiresAt: number } | null = null;
  private tokenRequestInProgress: Promise<string> | null = null;

  constructor(config?: Partial<BKashConfig>) {
    this.config = {
      // **IMPORTANT**: prefer v1.2.0-beta in sandbox (matches screenshots). Make configurable via env.
      baseUrl: process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
      username: process.env.BKASH_USERNAME || "sandboxTokenizedUser02",
      password: process.env.BKASH_PASSWORD || "sandboxTokenizedUser02@12345",
      // <-- Make sure these EXACT strings match your dashboard (no typos)
      appKey: process.env.BKASH_APP_KEY || "4f6o0cjiki2rfm34kfdadl1eqq",
      appSecret: process.env.BKASH_APP_SECRET || "2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b",
      ...config,
    };
  }

  async getAccessToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    if (this.tokenRequestInProgress) {
      return this.tokenRequestInProgress;
    }

    this.tokenRequestInProgress = this.requestAccessToken();
    try {
      const token = await this.tokenRequestInProgress;
      return token;
    } finally {
      this.tokenRequestInProgress = null;
    }
  }

  private async requestAccessToken(): Promise<string> {
    const url = `${this.config.baseUrl}/tokenized/checkout/token/grant`;
    try {
      const res = await axios.post(
        url,
        {
          app_key: this.config.appKey,
          app_secret: this.config.appSecret,
        },
        {
          headers: {
            username: this.config.username,
            password: this.config.password,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 30000, // 30 seconds
          validateStatus: () => true, // we'll handle status codes ourselves for better logging
        }
      );

      // DEBUG: always log full response in dev so we can see what's returned
      console.log("Using appKey:", this.config.appKey);
      console.log("Using appSecret:", this.config.appSecret);
      console.log("Using username:", this.config.username);
      console.log("Using password:", this.config.password);
      if (process.env.NODE_ENV !== "production") {
        console.log("[bKash] token grant response status:", res.status);
        console.log("[bKash] token grant response data:", JSON.stringify(res.data, null, 2));
      }

      // Check common token fields in order of likelihood
      const token =
        res.data?.id_token || res.data?.token || res.data?.access_token || res.data?.accessToken;

      if (!token) {
        // Include statusMessage or whole response to help debugging
        const msg =
          res.data?.statusMessage ||
          res.data?.message ||
          `Unexpected bKash token response (status ${res.status})`;
        console.error("[bKash] Token grant failed - response did not include token:", msg);
        throw new Error(msg);
      }

      // compute expiry: prefer expires_in from response if present
      const expiresIn = Number(res.data?.expires_in || res.data?.expiresIn || 3600);
      const safetyMs = 60 * 1000; // 1 minute safety margin
      this.tokenCache = {
        token,
        expiresAt: Date.now() + Math.max(0, expiresIn * 1000 - safetyMs),
      };

      return token;
    } catch (err: any) {
      // if axios produced response object, prefer that message
      const serverMsg = err?.response?.data || err?.message || err;
      console.error("[bKash] requestAccessToken error:", serverMsg);
      throw new Error(
        err?.response?.data?.statusMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to obtain bKash token"
      );
    }
  }

private async requestAuthorized<T = any>(path: string, body: any) {
  const token = await this.getAccessToken();

  const url = `${this.config.baseUrl}${path}`; // FIXED

  console.log("Calling:", url);

  const res = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,       // id_token directly
      "X-APP-Key": this.config.appKey,
    },
    timeout: 30000,
    validateStatus: () => true,
  });

  if (res.status !== 200) {
    console.error("[bKash] API ERROR:", res.status, res.data);
    throw new Error(res.data?.statusMessage || JSON.stringify(res.data));
  }

  return res.data;
}



  async createPayment(payload: {
    amount: string;
    merchantInvoiceNumber: string;
    callbackURL: string;
    payerReference?: string;
    merchantAssociationInfo?: string;
  }): Promise<{ paymentID: string; bkashURL: string; callbackURL: string }> {
    try {
      const data = await this.requestAuthorized("/tokenized/checkout/create", {
        mode: "0011",
        payerReference: payload.payerReference,
        callbackURL: payload.callbackURL,
        merchantAssociationInfo: payload.merchantAssociationInfo || "MI05MID54RF09123456One",
        amount: payload.amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: payload.merchantInvoiceNumber,
      });

      if (process.env.NODE_ENV !== "production") {
        console.log("[bKash] create response:", JSON.stringify(data, null, 2));
      }

      // Accept different possible key names
      const paymentID = data?.paymentID || data?.paymentId || data?.payment_id;
      const bkashURL = data?.bkashURL || data?.bkashUrl || data?.checkoutURL || data?.checkoutUrl;
      const callbackURL = data?.callbackURL || data?.callbackUrl || payload.callbackURL;

      if (!paymentID || !bkashURL) {
        console.error("[bKash] create returned incomplete data:", data);
        throw new Error("Invalid bKash create response");
      }

      return { paymentID, bkashURL, callbackURL };
    } catch (err: any) {
      console.error("[bKash] createPayment error:", err.response?.data || err.message || err);
      throw new Error(err.response?.data?.statusMessage || err.message || "Failed to create bKash payment");
    }
  }

async executePayment(paymentID: string) {
  if (!paymentID) throw new Error("PaymentID is required");

  const payload = { paymentID };

  const data = await this.requestAuthorized("/tokenized/checkout/execute", payload);

  console.log("[bKash] executePayment response:", data);

  if (!data || data.statusCode !== "0000") {
    throw new Error(data?.statusMessage || "bKash execute failed");
  }

  return {
    paymentID: data.paymentID,
    trxID: data.trxID,
    payerReference: data.payerReference || "01770618575",
    amount: data.amount,
    currency: data.currency,
    transactionStatus: data.transactionStatus,
    merchantInvoiceNumber: data.merchantInvoiceNumber,
  };
}


  async queryPayment(paymentID: string) {
    try {
      const data = await this.requestAuthorized("/tokenized/checkout/query", { paymentID });
      if (process.env.NODE_ENV !== "production") {
        console.log("[bKash] query response:", JSON.stringify(data, null, 2));
      }
      return data;
    } catch (err: any) {
      console.error("[bKash] queryPayment error:", err.response?.data || err.message || err);
      throw new Error(err.response?.data?.statusMessage || err.message || "Failed to query bKash payment");
    }
  }
}

export const bkashService = new BKashService();
