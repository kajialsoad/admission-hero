# 🔐 Credentials Configuration Guide
## Complete Setup for Google Firebase & bKash Payment

---

## 📱 **1. Google Firebase Credentials**

### ✅ **Current Configuration (All Platforms Using Same Project)**

**Firebase Project Details:**
- **Project ID**: `admission-hero`
- **Project Number**: `1066300392478`
- **Storage Bucket**: `admission-hero.firebasestorage.app`

---

### **A. Flutter App (Android)**

**Location**: `admission_hero_flutter/android/app/google-services.json`

```json
{
  "project_info": {
    "project_number": "1066300392478",
    "project_id": "admission-hero",
    "storage_bucket": "admission-hero.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:1066300392478:android:f06c61f83263d1d7ab9a0f",
        "android_client_info": {
          "package_name": "com.admissionhero.app"
        }
      },
      "oauth_client": [
        {
          "client_id": "1066300392478-9dgr9fllu0bhautn1kusidqf5u3mfqdi.apps.googleusercontent.com",
          "client_type": 1
        }
      ],
      "api_key": [
        {
          "current_key": "AIzaSyBqvum5plwm3BndV3ze-xD2qpD0jq0OtlQ"
        }
      ]
    }
  ]
}
```

**Also in**: `admission_hero_flutter/lib/firebase_options.dart`
- Android API Key: `AIzaSyBqvum5plwm3BndV3ze-xD2qpD0jq0OtlQ`
- Android App ID: `1:1066300392478:android:f06c61f83263d1d7ab9a0f`

---

### **B. Backend (Node.js/Express)**

**Location**: `backend/.env`

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=admission-hero
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@admission-hero.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[FULL_PRIVATE_KEY]\n-----END PRIVATE KEY-----\n"
FIREBASE_SERVER_KEY=BFy-F1cxsabV8LscO5t0zL9v2ZZR6gtZdTqzwqMS3jssKiYyezEcfoT7jT-SXEiA8uT4VNOXkH5REL-s2nBZEbk
```

**Used For**:
- Firebase Admin SDK initialization
- Push notifications
- User authentication verification
- Cloud messaging

---

### **C. Admin Dashboard (Next.js)**

**Location**: `admin-dashboard/.env`

```env
# Firebase Web SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBqvum5plwm3BndV3ze-xD2qpD0jq0OtlQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=admission-hero.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=admission-hero
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=admission-hero.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1066300392478
NEXT_PUBLIC_FIREBASE_APP_ID=1:1066300392478:web:8a633c37e5fc879cab9a0f
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-9K64ZTT32Z
```

**Used For**:
- Admin authentication
- Firebase Auth integration
- Cloud messaging for admin panel

---

## 💳 **2. bKash Payment Gateway Credentials**

### ✅ **Production Credentials (Currently Active)**

**Location**: `backend/.env`

```env
# bKash Payment Gateway - PRODUCTION Credentials
BKASH_BASE_URL=https://tokenized.pay.bka.sh/v1.2.0-beta
BKASH_USERNAME=01817337750
BKASH_PASSWORD=*KU3GVfwDn(
BKASH_APP_KEY=iA2BF9aF2TSCRibxnQEqnVpUtc
BKASH_APP_SECRET=47JhDFlv4e5qnEDTfTxnLumBGdYmgjg27gE0H8gXAh4jud1RB87n
```

---

### **🎛️ Admin Dashboard Control**

**Admin Dashboard Settings Page**: `/dashboard/settings`

**Features**:
1. ✅ **Enable/Disable bKash Payment** - Toggle করে on/off করা যায়
2. ✅ **Enable/Disable Google Play Billing** - Toggle করে on/off করা যায়
3. ✅ **Real-time Status Display** - Active/Inactive status দেখা যায়
4. ✅ **Warning System** - যদি কোনো payment method enable না থাকে তাহলে warning দেখায়

**API Endpoints**:
- **GET** `/api/admin/payment-settings` - Current settings fetch করে
- **PUT** `/api/admin/payment-settings` - Settings update করে

**Database Model**: `backend/src/models/PaymentSettings.ts`

```typescript
{
  bkashEnabled: boolean,           // Admin dashboard থেকে control
  googlePlayEnabled: boolean,      // Admin dashboard থেকে control
  bkashConfig: {
    username: string,              // Backend .env থেকে আসে
    appKey: string,                // Backend .env থেকে আসে
    baseUrl: string                // Backend .env থেকে আসে
  }
}
```

---

### **⚠️ Important Notes**:

1. **bKash Credentials Storage**:
   - Actual credentials (username, password, app key, app secret) **backend/.env** file এ stored
   - Admin dashboard শুধু enable/disable করতে পারে
   - Security এর জন্য sensitive credentials admin panel এ show হয় না

2. **How It Works**:
   ```
   Admin Dashboard (Enable/Disable) 
        ↓
   Backend API (/admin/payment-settings)
        ↓
   MongoDB (PaymentSettings collection)
        ↓
   Flutter App (Payment methods API call)
        ↓
   Shows/Hides payment options based on settings
   ```

3. **Flutter App Integration**:
   - Flutter app backend API call করে enabled payment methods check করে
   - Endpoint: `GET /api/subscription/enabled-payment-methods`
   - Response এ `bkashEnabled` এবং `googlePlayEnabled` status আসে
   - এর উপর based করে payment options show/hide হয়

---

## 🌐 **3. API URL Configuration**

### **Backend URL**: `https://munns-production.up.railway.app/api`

**Configured In**:

1. **Flutter App**: `admission_hero_flutter/lib/utils/constants.dart`
   ```dart
   static const String baseUrl = 'https://munns-production.up.railway.app/api';
   ```

2. **Admin Dashboard**: `admin-dashboard/.env`
   ```env
   NEXT_PUBLIC_API_URL=https://munns-production.up.railway.app/api
   ```

---

## 🔄 **4. How to Update Credentials**

### **A. Update Firebase Credentials**:

1. **Flutter App**:
   - Download new `google-services.json` from Firebase Console
   - Replace `admission_hero_flutter/android/app/google-services.json`
   - Run: `flutterfire configure` (optional, for auto-update)

2. **Backend**:
   - Update `backend/.env` file
   - Restart backend server

3. **Admin Dashboard**:
   - Update `admin-dashboard/.env` file
   - Rebuild and redeploy

### **B. Update bKash Credentials**:

1. **Backend Only**:
   - Update `backend/.env` file with new credentials
   - Restart backend server
   - Admin dashboard থেকে enable/disable control করা যাবে

### **C. Change Backend URL**:

1. Update in **Flutter**: `lib/utils/constants.dart`
2. Update in **Admin Dashboard**: `.env` file
3. Rebuild both apps

---

## ✅ **5. Verification Checklist**

- [x] Flutter app Firebase connected (google-services.json)
- [x] Backend Firebase Admin SDK configured
- [x] Admin Dashboard Firebase Web SDK configured
- [x] bKash credentials in backend .env
- [x] Admin Dashboard payment settings page working
- [x] Flutter app API URL pointing to Railway backend
- [x] Admin Dashboard API URL pointing to Railway backend
- [x] Payment settings API endpoints working
- [x] Enable/Disable toggle working from admin panel

---

## 🚀 **6. Testing Payment Settings**

### **Test Flow**:

1. **Login to Admin Dashboard**: `https://endearing-serenity-production-4ea0.up.railway.app`
2. **Go to Settings**: Click "Settings" in sidebar
3. **Toggle bKash**: Enable/Disable করে দেখুন
4. **Save Changes**: "Save Changes" button click করুন
5. **Check Flutter App**: Flutter app এ payment options check করুন
6. **Verify API**: Backend logs check করে verify করুন

### **API Test**:

```bash
# Get current payment settings
curl -X GET https://munns-production.up.railway.app/api/admin/payment-settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Update payment settings
curl -X PUT https://munns-production.up.railway.app/api/admin/payment-settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bkashEnabled": true,
    "googlePlayEnabled": false
  }'
```

---

## 📞 **Support**

If you need to update any credentials or facing issues:
1. Check this documentation first
2. Verify all .env files are properly configured
3. Restart services after credential updates
4. Check backend logs for any errors

---

**Last Updated**: May 2, 2026
**Status**: ✅ All credentials configured and working
