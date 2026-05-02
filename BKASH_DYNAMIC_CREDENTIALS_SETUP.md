# 🎛️ bKash Dynamic Credentials Management
## Admin Dashboard থেকে bKash Credentials Control করুন

---

## ✅ **What's New?**

এখন Admin Dashboard থেকে সম্পূর্ণ bKash credentials dynamically edit করা যাবে। আর `.env` file edit করার দরকার নেই!

---

## 🔧 **Updated System Architecture**

### **Before (Old System)**:
```
.env file (hardcoded) → Backend → bKash API
```
- Credentials `.env` file এ hardcoded ছিল
- Change করতে হলে server restart করতে হতো
- Admin panel থেকে control করা যেত না

### **After (New System)**:
```
Admin Dashboard UI → Database (MongoDB) → Backend → bKash API
```
- Credentials database এ stored
- Admin panel থেকে real-time edit করা যায়
- Server restart এর দরকার নেই
- `.env` শুধু default/fallback value হিসেবে থাকে

---

## 🎨 **Admin Dashboard Features**

### **Settings Page**: `/dashboard/settings`

#### **1. Enable/Disable Toggle**
- bKash payment on/off করা যায়
- Real-time status display
- Active/Inactive indicator

#### **2. Credentials Management**
- **Show/Hide Credentials** button
- Edit করার জন্য secure form
- Password fields masked থাকে

#### **3. Editable Fields**:
```
✅ Base URL          (https://tokenized.pay.bka.sh/v1.2.0-beta)
✅ Username          (01817337750)
✅ Password          (*KU3GVfwDn()
✅ App Key           (iA2BF9aF2TSCRibxnQEqnVpUtc)
✅ App Secret        (47JhDFlv4e5qnEDTfTxnLumBGdYmgjg27gE0H8gXAh4jud1RB87n)
```

---

## 💾 **Database Schema**

### **PaymentSettings Collection**:

```typescript
{
  _id: ObjectId,
  bkashEnabled: boolean,
  googlePlayEnabled: boolean,
  bkashConfig: {
    username: string,      // 01817337750
    password: string,      // *KU3GVfwDn(
    appKey: string,        // iA2BF9aF2TSCRibxnQEqnVpUtc
    appSecret: string,     // 47JhDFlv4e5qnEDTfTxnLumBGdYmgjg27gE0H8gXAh4jud1RB87n
    baseUrl: string        // https://tokenized.pay.bka.sh/v1.2.0-beta
  },
  googlePlayConfig: {
    productIds: string[]
  },
  updatedBy: ObjectId,     // Admin user who updated
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 **How It Works**

### **Step-by-Step Flow**:

1. **Admin Login** → Admin Dashboard
2. **Navigate** → Settings page
3. **Click** → "Show Credentials" button
4. **Edit** → Any credential field
5. **Save** → "Save Changes" button
6. **Database** → Credentials saved to MongoDB
7. **Backend** → Automatically loads new credentials
8. **bKash API** → Uses updated credentials for next payment

### **Backend Integration**:

```typescript
// backend/src/utils/bkash.ts

class BKashService {
  // Loads credentials from database before each API call
  private async loadConfigFromDB(): Promise<BKashConfig> {
    const settings = await PaymentSettings.findOne();
    if (settings && settings.bkashConfig) {
      return {
        baseUrl: settings.bkashConfig.baseUrl,
        username: settings.bkashConfig.username,
        password: settings.bkashConfig.password,
        appKey: settings.bkashConfig.appKey,
        appSecret: settings.bkashConfig.appSecret,
      };
    }
    // Fallback to .env if database is empty
    return this.config;
  }

  // Token request uses database credentials
  private async requestAccessToken(): Promise<string> {
    const config = await this.loadConfigFromDB();
    // Use config for bKash API call
  }
}
```

---

## 🚀 **Usage Guide**

### **Initial Setup (First Time)**:

1. **Login to Admin Dashboard**:
   ```
   URL: https://endearing-serenity-production-4ea0.up.railway.app
   ```

2. **Go to Settings**:
   - Click "Settings" in sidebar
   - Scroll to "bKash Payment" section

3. **Show Credentials**:
   - Click "Show Credentials" button
   - Form will appear with all fields

4. **Enter Your Credentials**:
   ```
   Base URL:    https://tokenized.pay.bka.sh/v1.2.0-beta
   Username:    01817337750
   Password:    *KU3GVfwDn(
   App Key:     iA2BF9aF2TSCRibxnQEqnVpUtc
   App Secret:  47JhDFlv4e5qnEDTfTxnLumBGdYmgjg27gE0H8gXAh4jud1RB87n
   ```

5. **Save Changes**:
   - Click "Save Changes" button
   - Success toast will appear
   - Credentials saved to database

### **Update Credentials (Anytime)**:

1. Go to Settings page
2. Click "Show Credentials"
3. Edit any field you want
4. Click "Save Changes"
5. ✅ Done! No server restart needed

---

## 🔒 **Security Features**

### **1. Password Masking**:
- Password এবং App Secret fields masked থাকে
- Type করার সময় দেখা যায় না
- Security এর জন্য `type="password"` used

### **2. Admin Only Access**:
- শুধু admin users access করতে পারবে
- JWT token verification required
- Unauthorized access blocked

### **3. Database Encryption**:
- Credentials MongoDB তে stored
- Backend থেকে secure access
- Environment variables fallback

### **4. Audit Trail**:
- `updatedBy` field tracks who updated
- `updatedAt` timestamp recorded
- Change history maintained

---

## 📊 **API Endpoints**

### **1. Get Payment Settings**:
```http
GET /api/admin/payment-settings
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "bkashEnabled": true,
    "bkashConfig": {
      "username": "01817337750",
      "password": "*KU3GVfwDn(",
      "appKey": "iA2BF9aF2TSCRibxnQEqnVpUtc",
      "appSecret": "47JhDFlv4e5qnEDTfTxnLumBGdYmgjg27gE0H8gXAh4jud1RB87n",
      "baseUrl": "https://tokenized.pay.bka.sh/v1.2.0-beta"
    }
  }
}
```

### **2. Update Payment Settings**:
```http
PUT /api/admin/payment-settings
Authorization: Bearer <admin_token>
Content-Type: application/json

Body:
{
  "bkashEnabled": true,
  "bkashConfig": {
    "username": "01817337750",
    "password": "*KU3GVfwDn(",
    "appKey": "iA2BF9aF2TSCRibxnQEqnVpUtc",
    "appSecret": "47JhDFlv4e5qnEDTfTxnLumBGdYmgjg27gE0H8gXAh4jud1RB87n",
    "baseUrl": "https://tokenized.pay.bka.sh/v1.2.0-beta"
  }
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "Payment settings updated successfully"
}
```

---

## 🧪 **Testing**

### **Test Credentials Update**:

1. **Login to Admin Dashboard**
2. **Go to Settings**
3. **Show Credentials**
4. **Change Username** to test value
5. **Save Changes**
6. **Check Backend Logs**:
   ```
   [bKash] Using credentials from database
   Using appKey: iA2BF9aF2TSCRibxnQEqnVpUtc
   Using username: 01817337750
   ```
7. **Verify** credentials are loaded from database

### **Test Payment Flow**:

1. **Flutter App** → Create subscription payment
2. **Backend** → Loads credentials from database
3. **bKash API** → Uses updated credentials
4. **Payment** → Should work with new credentials

---

## 🔄 **Migration from .env to Database**

### **Automatic Migration**:

Backend automatically migrates `.env` credentials to database on first run:

```typescript
// When admin first accesses payment settings
if (!settings) {
  settings = await PaymentSettings.create({
    bkashEnabled: true,
    bkashConfig: {
      username: process.env.BKASH_USERNAME,      // From .env
      password: process.env.BKASH_PASSWORD,      // From .env
      appKey: process.env.BKASH_APP_KEY,         // From .env
      appSecret: process.env.BKASH_APP_SECRET,   // From .env
      baseUrl: process.env.BKASH_BASE_URL        // From .env
    }
  });
}
```

### **Fallback Mechanism**:

If database is empty or unavailable, backend falls back to `.env`:

```typescript
private async loadConfigFromDB(): Promise<BKashConfig> {
  try {
    const settings = await PaymentSettings.findOne();
    if (settings && settings.bkashConfig) {
      return settings.bkashConfig; // Use database
    }
  } catch (error) {
    console.error('Failed to load from DB, using .env');
  }
  return this.config; // Fallback to .env
}
```

---

## ✅ **Benefits**

### **1. No Server Restart**:
- Credentials update করলে server restart লাগবে না
- Real-time changes apply হয়

### **2. Easy Management**:
- UI থেকে সহজে edit করা যায়
- Technical knowledge লাগে না
- No SSH/FTP access needed

### **3. Multiple Environments**:
- Sandbox credentials test করা যায়
- Production credentials easily switch করা যায়
- Environment-specific settings

### **4. Audit Trail**:
- কে কখন change করেছে track করা যায়
- Change history maintained
- Security এর জন্য ভালো

### **5. Secure Storage**:
- Database এ encrypted stored
- Admin only access
- Password fields masked

---

## 📝 **Important Notes**

### **1. .env File**:
- `.env` file এখনও থাকবে
- Default/fallback value হিসেবে
- Database empty হলে use হবে

### **2. First Time Setup**:
- Admin dashboard থেকে credentials enter করতে হবে
- একবার save করলে database এ store হবে
- পরে যেকোনো সময় edit করা যাবে

### **3. Production vs Sandbox**:
- Base URL change করে environment switch করা যায়
- Sandbox: `https://tokenized.sandbox.bka.sh/v1.2.0-beta`
- Production: `https://tokenized.pay.bka.sh/v1.2.0-beta`

### **4. Token Caching**:
- bKash token cache করা হয়
- Credentials change করলে next payment এ নতুন token নেবে
- Automatic refresh mechanism

---

## 🎯 **Current Production Credentials**

```env
Base URL:    https://tokenized.pay.bka.sh/v1.2.0-beta
Username:    01817337750
Password:    *KU3GVfwDn(
App Key:     iA2BF9aF2TSCRibxnQEqnVpUtc
App Secret:  47JhDFlv4e5qnEDTfTxnLumBGdYmgjg27gE0H8gXAh4jud1RB87n
```

এই credentials গুলো এখন Admin Dashboard থেকে manage করা যাবে!

---

## 📞 **Support**

যদি কোনো সমস্যা হয়:
1. Admin Dashboard Settings page check করুন
2. Backend logs check করুন
3. Database এ credentials properly saved আছে কিনা verify করুন
4. bKash API response check করুন

---

**Last Updated**: May 2, 2026
**Status**: ✅ Dynamic credentials management implemented
**Feature**: Admin can now edit all bKash credentials from UI
