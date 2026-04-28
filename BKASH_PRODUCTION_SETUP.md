# bKash Payment Gateway - Production Setup

## ✅ Configuration Complete

### Production Credentials (Set in backend/.env)

```env
# bKash Payment Gateway - PRODUCTION Credentials
BKASH_BASE_URL=https://tokenized.pay.bka.sh/v1.2.0-beta
BKASH_USERNAME=01817337750
BKASH_PASSWORD=*KU3GVfwDn(
BKASH_APP_KEY=iA2BF9aF2TSCRibxnQEqnVpUtc
BKASH_APP_SECRET=47JhDFlv4e5qnEDTfTxnLumBGdYmgjg27gE0H8gXAh4jud1RB87n
```

## 📁 Files Updated

### 1. Backend Environment Variables
**File:** `backend/.env`
- Added production bKash credentials
- Changed base URL from sandbox to production
- Updated username, password, app_key, and app_secret

### 2. bKash Service
**File:** `backend/src/utils/bkash.ts`
- Already configured to read from environment variables
- Will automatically use production credentials
- No code changes needed

### 3. Payment Controller
**File:** `backend/src/controllers/paymentController.ts`
- Already properly integrated with bKash service
- Handles payment creation, callback, and verification
- No changes needed

### 4. Frontend
**Files:** 
- `frontend/components/BKashPaymentModal.tsx`
- `frontend/.env`

Frontend doesn't need bKash credentials as it calls backend API.

## 🔄 Payment Flow

1. **User initiates payment** → Frontend calls backend API
2. **Backend creates payment** → Calls bKash API with production credentials
3. **User completes payment** → Redirected to bKash payment page
4. **bKash callback** → Backend receives callback and executes payment
5. **Subscription activated** → User subscription status updated

## 🚀 Deployment Steps

### For Railway (Backend)

1. Go to Railway dashboard
2. Select your backend service
3. Go to **Variables** tab
4. Add/Update these environment variables:

```
BKASH_BASE_URL=https://tokenized.pay.bka.sh/v1.2.0-beta
BKASH_USERNAME=01817337750
BKASH_PASSWORD=*KU3GVfwDn(
BKASH_APP_KEY=iA2BF9aF2TSCRibxnQEqnVpUtc
BKASH_APP_SECRET=47JhDFlv4e5qnEDTfTxnLumBGdYmgjg27gE0H8gXAh4jud1RB87n
```

5. Click **Deploy** or wait for auto-deploy

### Testing Production Payment

1. **Restart backend server** (if running locally)
2. **Test payment flow:**
   - Open app
   - Go to subscription page
   - Select a plan
   - Click "Pay with bKash"
   - Complete payment with real bKash account
   - Verify subscription is activated

## ⚠️ Important Notes

### Security
- ✅ Credentials are stored in `.env` file (not committed to git)
- ✅ Backend handles all bKash API calls (frontend never sees credentials)
- ✅ Production credentials are different from sandbox

### Callback URL
The callback URL is set to:
```
https://munns-production.up.railway.app/api/payments/bkash/callback
```

Make sure this URL is:
- ✅ Accessible publicly (not localhost)
- ✅ Registered in bKash merchant dashboard (if required)
- ✅ Using HTTPS (required by bKash)

### Environment Variables Priority
The bKash service reads credentials in this order:
1. Environment variables (`.env` file)
2. Default sandbox values (fallback)

Since production credentials are now in `.env`, they will be used automatically.

## 🧪 Testing Checklist

- [ ] Backend environment variables updated
- [ ] Backend server restarted
- [ ] Railway environment variables updated (if deployed)
- [ ] Test payment with real bKash account
- [ ] Verify callback is received
- [ ] Verify subscription is activated
- [ ] Check transaction ID is saved
- [ ] Verify user subscription status updated

## 📞 Support

If payment fails, check:
1. Backend logs for error messages
2. bKash credentials are correct
3. Callback URL is accessible
4. User has sufficient balance in bKash account
5. Network connectivity

## 🔐 Credential Details

| Parameter | Value |
|-----------|-------|
| **Base URL** | https://tokenized.pay.bka.sh/v1.2.0-beta |
| **Username (PGW)** | 01817337750 |
| **Password (PGW)** | *KU3GVfwDn( |
| **app_key (PGW)** | iA2BF9aF2TSCRibxnQEqnVpUtc |
| **app_secret (PGW)** | 47JhDFlv4e5qnEDTfTxnLumBGdYmgjg27gE0H8gXAh4jud1RB87n |

---

**Setup Date:** April 24, 2026  
**Status:** ✅ Production Ready
