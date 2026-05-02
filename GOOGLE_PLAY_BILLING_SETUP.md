# 🎮 Google Play Billing Complete Setup Guide
## Flutter App + Backend + Admin Dashboard Integration

---

## ✅ **What's Implemented:**

### **1. Flutter App**:
- ✅ `in_app_purchase` package added
- ✅ Google Play Billing service created
- ✅ Payment flow integrated
- ✅ Product management
- ✅ Purchase verification

### **2. Backend**:
- ✅ Google Play verification endpoint
- ✅ Purchase validation logic
- ✅ Subscription creation
- ✅ Payment recording
- ✅ User subscription update

### **3. Admin Dashboard**:
- ✅ Google Play credentials management UI
- ✅ Enable/Disable toggle
- ✅ Service account configuration
- ✅ Product IDs management
- ✅ Real-time status display

---

## 📦 **Required Packages**

### **Flutter** (`pubspec.yaml`):
```yaml
dependencies:
  in_app_purchase: ^3.2.0
```

### **Backend** (`package.json`):
```json
{
  "dependencies": {
    "googleapis": "^latest"
  }
}
```

---

## 🔧 **Google Play Console Setup**

### **Step 1: Create In-App Products**

1. **Go to Google Play Console**:
   - Navigate to your app
   - Go to **Monetization setup** → **Products** → **Subscriptions**

2. **Create Subscription Products**:
   
   **Monthly Subscription**:
   ```
   Product ID: admission_hero_monthly
   Name: Admission Hero Monthly
   Description: Monthly subscription for full access
   Price: 299 BDT (or your price)
   Billing period: 1 month
   ```

   **Yearly Subscription**:
   ```
   Product ID: admission_hero_yearly
   Name: Admission Hero Yearly
   Description: Yearly subscription for full access
   Price: 2999 BDT (or your price)
   Billing period: 1 year
   ```

3. **Activate Products**:
   - Make sure products are **Active**
   - Set up pricing for Bangladesh (BDT)

---

### **Step 2: Create Service Account**

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com
   - Select your project (same as Firebase project)

2. **Enable Google Play Developer API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Play Android Developer API"
   - Click **Enable**

3. **Create Service Account**:
   - Go to **IAM & Admin** → **Service Accounts**
   - Click **Create Service Account**
   - Name: `google-play-billing`
   - Description: `Service account for Google Play billing verification`
   - Click **Create and Continue**

4. **Grant Permissions**:
   - Role: **Service Account User**
   - Click **Continue** → **Done**

5. **Create JSON Key**:
   - Click on the created service account
   - Go to **Keys** tab
   - Click **Add Key** → **Create new key**
   - Choose **JSON** format
   - Click **Create** (JSON file will download)

6. **Link to Google Play Console**:
   - Go back to **Google Play Console**
   - Go to **Setup** → **API access**
   - Click **Link** next to your service account
   - Grant **View financial data** permission
   - Click **Invite user** → **Send invitation**

---

## 🎛️ **Admin Dashboard Configuration**

### **Step 1: Login to Admin Dashboard**
```
URL: https://endearing-serenity-production-4ea0.up.railway.app
```

### **Step 2: Go to Settings**
- Click **Settings** in sidebar
- Scroll to **Google Play Billing** section

### **Step 3: Enable Google Play**
- Toggle **Enable Google Play Billing** to ON
- Status will show "Google Play Billing is Active"

### **Step 4: Configure Credentials**
- Click **Show Credentials** button
- Fill in the following fields:

#### **Package Name**:
```
com.admissionhero.app
```
*(Your Android app package name from build.gradle)*

#### **Service Account Email**:
```
google-play-billing@your-project.iam.gserviceaccount.com
```
*(From the JSON key file: "client_email" field)*

#### **Service Account Key (JSON)**:
```json
{
  "type": "service_account",
  "project_id": "admission-hero",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "google-play-billing@admission-hero.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```
*(Paste the entire content of downloaded JSON key file)*

#### **Product IDs**:
```
admission_hero_monthly, admission_hero_yearly
```
*(Comma-separated list of your product IDs)*

### **Step 5: Save Changes**
- Click **Save Changes** button
- Success message will appear
- Credentials saved to database

---

## 📱 **Flutter App Integration**

### **File Structure**:
```
lib/
├── services/
│   ├── google_play_billing_service.dart  ✅ Created
│   └── subscription_service.dart          ✅ Updated
├── screens/
│   └── subscription/
│       └── new_subscription_screen.dart   ✅ Updated
└── providers/
    └── subscription_provider.dart         ✅ Already has support
```

### **Usage in Flutter**:

```dart
import 'package:admission_hero_flutter/services/google_play_billing_service.dart';

// Initialize billing service
final billingService = GooglePlayBillingService();
await billingService.initialize();

// Load products
await billingService.loadProducts();

// Purchase a product
await billingService.purchaseProduct('admission_hero_monthly');

// Handle purchase success
billingService.onPurchaseSuccess = (purchaseDetails) {
  // Verify with backend
  verifyPurchaseWithBackend(purchaseDetails);
};

// Handle purchase error
billingService.onPurchaseError = (error) {
  print('Purchase error: $error');
};
```

---

## 🔄 **Payment Flow**

### **Complete Flow Diagram**:

```
1. User selects package in Flutter app
   ↓
2. User selects "Google Play" payment method
   ↓
3. Flutter app calls Google Play Billing API
   ↓
4. Google Play shows payment dialog
   ↓
5. User completes payment
   ↓
6. Google Play returns purchase details
   ↓
7. Flutter app sends purchase token to backend
   ↓
8. Backend verifies with Google Play API
   ↓
9. Backend creates subscription
   ↓
10. Backend updates user status
   ↓
11. Flutter app shows success message
   ↓
12. User gets access to premium features
```

### **API Endpoint**:

**POST** `/api/payments/google-play/verify`

**Headers**:
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "productId": "admission_hero_monthly",
  "purchaseToken": "abcdef123456...",
  "packageType": "monthly",
  "orderId": "GPA.1234-5678-9012-34567"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Google Play purchase verified successfully",
  "data": {
    "subscription": {
      "id": "...",
      "status": "active",
      "startDate": "2026-05-02T...",
      "expireAt": "2026-06-02T...",
      "package": { ... }
    },
    "payment": {
      "id": "...",
      "amount": 299,
      "transactionId": "GPA.1234-5678-9012-34567",
      "status": "completed"
    }
  }
}
```

---

## 🧪 **Testing**

### **Test Mode (Sandbox)**:

1. **Add Test Accounts**:
   - Go to Google Play Console
   - **Setup** → **License testing**
   - Add test Gmail accounts
   - These accounts can make test purchases without real money

2. **Test Purchase Flow**:
   - Install app on device with test account
   - Select a subscription package
   - Choose Google Play payment
   - Complete test purchase
   - Verify subscription activated

3. **Check Backend Logs**:
   ```
   [GooglePlay] Verification request: { userId, productId, packageType }
   [GooglePlay] Creating subscription for user: ...
   [GooglePlay] Subscription created successfully
   ```

### **Production Testing**:

1. **Create Closed Testing Track**:
   - Upload signed APK/AAB
   - Add testers
   - Test real purchases with real money

2. **Verify Purchase**:
   - Check Google Play Console → **Order management**
   - Verify backend created subscription
   - Check user subscription status in admin dashboard

---

## 🔒 **Security Considerations**

### **1. Server-Side Verification**:
- ✅ Always verify purchases on backend
- ✅ Never trust client-side purchase data
- ✅ Use Google Play Developer API for verification

### **2. Service Account Security**:
- ✅ Store JSON key securely in database
- ✅ Never commit JSON key to git
- ✅ Limit service account permissions
- ✅ Rotate keys periodically

### **3. Purchase Token Validation**:
- ✅ Verify purchase token with Google
- ✅ Check expiry time
- ✅ Validate payment state
- ✅ Prevent replay attacks

---

## 📊 **Database Schema**

### **PaymentSettings Collection**:
```typescript
{
  googlePlayEnabled: boolean,
  googlePlayConfig: {
    packageName: "com.admissionhero.app",
    serviceAccountEmail: "google-play-billing@...",
    serviceAccountKey: "{...JSON key...}",
    productIds: ["admission_hero_monthly", "admission_hero_yearly"]
  }
}
```

### **Payment Collection**:
```typescript
{
  user: ObjectId,
  subscription: ObjectId,
  amount: 299,
  method: "google_play",
  transactionId: "GPA.1234-5678-9012-34567",
  status: "completed",
  metadata: {
    productId: "admission_hero_monthly",
    purchaseToken: "...",
    orderId: "GPA.1234-5678-9012-34567"
  }
}
```

---

## 🎯 **Product IDs Mapping**

| Package Type | Product ID | Price | Duration |
|-------------|-----------|-------|----------|
| Monthly | `admission_hero_monthly` | 299 BDT | 1 month |
| Yearly | `admission_hero_yearly` | 2999 BDT | 1 year |

---

## 🚀 **Deployment Checklist**

### **Before Going Live**:

- [ ] Google Play Console products created and activated
- [ ] Service account created with proper permissions
- [ ] JSON key downloaded and configured in admin dashboard
- [ ] Backend API endpoint tested
- [ ] Flutter app tested with test accounts
- [ ] Purchase verification working
- [ ] Subscription creation working
- [ ] User status update working
- [ ] Admin dashboard shows correct status
- [ ] Closed testing completed successfully

### **After Going Live**:

- [ ] Monitor Google Play Console for orders
- [ ] Check backend logs for verification requests
- [ ] Verify subscriptions are being created
- [ ] Test with real money (small amount)
- [ ] Monitor for any errors or issues
- [ ] Set up alerts for failed verifications

---

## 🔧 **Troubleshooting**

### **Issue: Products not loading in Flutter app**
**Solution**:
- Check product IDs match exactly
- Verify products are active in Google Play Console
- Check app is signed with correct keystore
- Wait 24 hours after creating products

### **Issue: Purchase verification fails**
**Solution**:
- Check service account has correct permissions
- Verify JSON key is valid
- Check Google Play Developer API is enabled
- Verify package name matches

### **Issue: Subscription not created**
**Solution**:
- Check backend logs for errors
- Verify purchase token is valid
- Check database connection
- Verify package exists in database

---

## 📞 **Support Resources**

- **Google Play Console**: https://play.google.com/console
- **Google Cloud Console**: https://console.cloud.google.com
- **Google Play Developer API Docs**: https://developers.google.com/android-publisher
- **Flutter In-App Purchase**: https://pub.dev/packages/in_app_purchase

---

## 📝 **Important Notes**

1. **Testing**: Always test with test accounts before going live
2. **Verification**: Always verify purchases on backend, never trust client
3. **Security**: Keep service account JSON key secure
4. **Monitoring**: Monitor Google Play Console and backend logs
5. **Support**: Provide clear instructions to users for payment issues

---

**Last Updated**: May 2, 2026
**Status**: ✅ Google Play Billing fully configured
**Ready for**: Testing and deployment
