# 🧪 Payment Methods Testing Guide
## How to Enable and Test bKash & Google Play Billing

---

## 🔍 **Current Issue:**

Flutter app এ subscription screen এ শুধু bKash দেখাচ্ছে, Google Play Billing option দেখাচ্ছে না।

---

## 🎯 **Solution Steps:**

### **Step 1: Enable Google Play in Admin Dashboard**

1. **Login to Admin Dashboard**:
   ```
   URL: https://endearing-serenity-production-4ea0.up.railway.app
   ```

2. **Go to Settings**:
   - Click "Settings" in sidebar
   - Scroll to "Google Play Billing" section

3. **Enable Google Play**:
   - Toggle "Enable Google Play Billing" to **ON**
   - Status should show "Google Play Billing is Active"

4. **Save Changes**:
   - Click "Save Changes" button
   - Wait for success message

---

### **Step 2: Verify Backend API**

Test the payment methods endpoint:

```bash
curl https://munns-production.up.railway.app/api/subscription/payment-methods

# Expected Response:
{
  "success": true,
  "data": {
    "bkashEnabled": true,
    "googlePlayEnabled": true
  }
}
```

If `googlePlayEnabled` is `false`, go back to Step 1 and enable it.

---

### **Step 3: Test in Flutter App**

1. **Restart Flutter App**:
   ```bash
   flutter run
   ```

2. **Navigate to Subscription**:
   - Open app
   - Go to Subscription screen
   - Check payment methods section

3. **Verify Display**:
   - You should see debug info at top: `bKash: ✓ | Google: ✓`
   - Both payment method cards should be visible:
     - **bKash** card
     - **Google Play** card

---

## 🐛 **Debugging:**

### **Check 1: Provider Loading**

Add this to `subscription_provider.dart` in `loadEnabledPaymentMethods()`:

```dart
Future<void> loadEnabledPaymentMethods() async {
  try {
    final methods = await _service.getEnabledPaymentMethods();
    _bkashEnabled = methods['bkashEnabled'] ?? true;
    _googlePlayEnabled = methods['googlePlayEnabled'] ?? false;
    
    // DEBUG: Print values
    print('🔍 Payment Methods Loaded:');
    print('   bKash: $_bkashEnabled');
    print('   Google Play: $_googlePlayEnabled');
    
    notifyListeners();
  } catch (e) {
    print('❌ Load enabled payment methods error: $e');
  }
}
```

### **Check 2: API Response**

Add this to `subscription_service.dart` in `getEnabledPaymentMethods()`:

```dart
if (response.statusCode == 200) {
  final data = jsonDecode(response.body);
  
  // DEBUG: Print full response
  print('🔍 API Response: $data');
  
  if (data['success'] == true) {
    return {
      'bkashEnabled': data['data']['bkashEnabled'] ?? false,
      'googlePlayEnabled': data['data']['googlePlayEnabled'] ?? false,
    };
  }
}
```

### **Check 3: Backend Logs**

Check Railway logs:

```bash
railway logs --tail

# Look for:
[GET] /api/subscription/payment-methods
Payment methods retrieved successfully
```

---

## 🎛️ **Admin Dashboard Configuration:**

### **Current Settings:**

Check `backend/src/models/PaymentSettings.ts`:

```typescript
{
  bkashEnabled: boolean,      // Should be true
  googlePlayEnabled: boolean, // Should be true
  bkashConfig: { ... },
  googlePlayConfig: { ... }
}
```

### **Default Values:**

In `backend/src/controllers/adminController.ts`:

```typescript
if (!settings) {
  settings = await PaymentSettings.create({
    bkashEnabled: true,
    googlePlayEnabled: false,  // ⚠️ This is false by default!
    // ...
  });
}
```

**Solution**: Change default to `true` or enable from admin dashboard.

---

## 🔧 **Quick Fix Options:**

### **Option 1: Enable from Admin Dashboard** (Recommended)

1. Login to admin dashboard
2. Go to Settings
3. Enable Google Play Billing
4. Save changes
5. Restart Flutter app

### **Option 2: Change Default in Backend**

Edit `backend/src/controllers/adminController.ts`:

```typescript
if (!settings) {
  settings = await PaymentSettings.create({
    bkashEnabled: true,
    googlePlayEnabled: true,  // ✅ Changed to true
    // ...
  });
}
```

Then redeploy backend.

### **Option 3: Temporary Testing (Flutter Only)**

Edit `admission_hero_flutter/lib/providers/subscription_provider.dart`:

```dart
// Enabled payment methods
bool _bkashEnabled = true;
bool _googlePlayEnabled = true; // ✅ Temporarily true for testing
```

**Note**: This is only for testing. In production, it should load from backend.

---

## 📱 **Expected UI:**

### **When Both Enabled:**

```
┌─────────────────────────────────────┐
│ পেমেন্ট মেথড সিলেক্ট করুন          │
│ bKash: ✓ | Google: ✓               │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 💳 bKash                        │ │
│ │ Pay with bKash                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ▶️ Google Play                  │ │
│ │ Pay with Google Play            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **When Only bKash Enabled:**

```
┌─────────────────────────────────────┐
│ পেমেন্ট মেথড সিলেক্ট করুন          │
│ bKash: ✓ | Google: ✗               │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 💳 bKash                        │ │
│ │ Pay with bKash                  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **When None Enabled:**

```
┌─────────────────────────────────────┐
│ পেমেন্ট মেথড সিলেক্ট করুন          │
│ bKash: ✗ | Google: ✗               │
├─────────────────────────────────────┤
│ ⚠️ কোনো পেমেন্ট মেথড এভেইলেবল নেই │
│    দয়া করে সাপোর্টে যোগাযোগ করুন  │
└─────────────────────────────────────┘
```

---

## 🧪 **Testing Checklist:**

### **Backend:**
- [ ] Admin dashboard settings page loads
- [ ] Google Play toggle works
- [ ] Save changes successful
- [ ] API endpoint returns correct values
- [ ] Backend logs show no errors

### **Flutter:**
- [ ] App loads without errors
- [ ] Subscription screen shows payment methods
- [ ] Debug info shows correct status
- [ ] Both payment cards visible (when enabled)
- [ ] Payment method selection works
- [ ] Pay button enabled

### **Integration:**
- [ ] Enabling in admin dashboard reflects in app
- [ ] Disabling in admin dashboard hides option
- [ ] Real-time updates work (after app restart)

---

## 🚀 **Production Deployment:**

### **Before Going Live:**

1. **Enable Google Play in Admin Dashboard**
2. **Configure Google Play credentials**
3. **Test with test account**
4. **Remove debug info from UI**
5. **Deploy to production**

### **Remove Debug Info:**

In `new_subscription_screen.dart`, remove this section:

```dart
// Debug info (remove in production)
Text(
  'bKash: ${provider.bkashEnabled ? "✓" : "✗"} | Google: ${provider.googlePlayEnabled ? "✓" : "✗"}',
  style: TextStyle(
    fontSize: 10,
    color: Colors.grey.shade600,
  ),
),
```

---

## 📞 **Support:**

If payment methods still not showing:

1. **Check backend logs**: `railway logs`
2. **Check Flutter logs**: `flutter logs`
3. **Verify API response**: Use curl or Postman
4. **Check admin dashboard**: Verify settings saved
5. **Restart app**: Sometimes cache needs clearing

---

## 🎯 **Summary:**

**Problem**: Google Play not showing in Flutter app
**Cause**: `googlePlayEnabled` is `false` in backend
**Solution**: Enable from admin dashboard or change default value
**Testing**: Use debug info to verify status
**Production**: Remove debug info before deployment

---

**Last Updated**: May 2, 2026
**Status**: ✅ Debug info added, ready for testing
