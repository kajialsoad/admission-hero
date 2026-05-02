# Testing Guide - Payment Settings Feature

## 🧪 HOW TO TEST THE PAYMENT SETTINGS FEATURE

### Prerequisites:
- Backend running on port 5000 ✅ (Already running)
- Admin dashboard running (need to start)
- Flutter app running (need to start)

---

## 1️⃣ TEST BACKEND API

### Test 1: Get Payment Settings (Admin)
```bash
# Login as admin first to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Use the token from login response
curl -X GET http://localhost:5000/api/admin/payment-settings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "bkashEnabled": true,
    "googlePlayEnabled": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Test 2: Update Payment Settings (Admin)
```bash
curl -X PUT http://localhost:5000/api/admin/payment-settings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"bkashEnabled":false,"googlePlayEnabled":true}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "bkashEnabled": false,
    "googlePlayEnabled": true,
    ...
  },
  "message": "Payment settings updated successfully"
}
```

### Test 3: Get Enabled Payment Methods (Public)
```bash
curl -X GET http://localhost:5000/api/subscription/payment-methods
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "bkashEnabled": true,
    "googlePlayEnabled": false
  }
}
```

---

## 2️⃣ TEST ADMIN DASHBOARD

### Step 1: Start Admin Dashboard
```bash
cd admin-dashboard
npm run dev
```

### Step 2: Login to Dashboard
1. Open browser: http://localhost:3000
2. Login with admin credentials
3. You should see the dashboard

### Step 3: Test Settings Page
1. Click "Settings" in the sidebar (gear icon)
2. You should see the Settings page with:
   - bKash toggle switch
   - Google Play toggle switch
   - Status indicators (green/red/yellow)
   - Summary card
   - Save and Reset buttons

### Step 4: Test Toggle Switches
1. **Test bKash Toggle:**
   - Click the bKash toggle to disable it
   - Status should change to "Disabled" (red)
   - Summary card should update
   - Click "Save Changes"
   - Should show success toast message

2. **Test Google Play Toggle:**
   - Click the Google Play toggle to enable it
   - Status should change to "Active" (green)
   - Summary card should update
   - Click "Save Changes"
   - Should show success toast message

3. **Test Warning Message:**
   - Disable both bKash and Google Play
   - Should see red warning: "No payment methods are enabled"
   - Click "Save Changes"

4. **Test Reset Button:**
   - Make some changes (don't save)
   - Click "Reset" button
   - Should reload original settings

### Step 5: Verify in Database
```bash
# Connect to MongoDB and check
use admission_hero
db.paymentsettings.find().pretty()
```

---

## 3️⃣ TEST FLUTTER APP

### Step 1: Start Flutter App
```bash
cd admission_hero_flutter
flutter run
```

### Step 2: Navigate to Subscription Screen
1. Open the app
2. Login with a test user
3. Navigate to Subscription screen

### Step 3: Test Payment Method Visibility

**Scenario 1: Both Methods Enabled**
1. In admin dashboard, enable both bKash and Google Play
2. Save settings
3. In Flutter app, go to Subscription screen
4. Should see both payment method cards:
   - bKash card
   - Google Play card

**Scenario 2: Only bKash Enabled**
1. In admin dashboard, enable bKash, disable Google Play
2. Save settings
3. In Flutter app, refresh/reopen Subscription screen
4. Should see only bKash payment card
5. Google Play card should be hidden

**Scenario 3: Only Google Play Enabled**
1. In admin dashboard, disable bKash, enable Google Play
2. Save settings
3. In Flutter app, refresh/reopen Subscription screen
4. Should see only Google Play payment card
5. bKash card should be hidden

**Scenario 4: No Methods Enabled**
1. In admin dashboard, disable both bKash and Google Play
2. Save settings
3. In Flutter app, refresh/reopen Subscription screen
4. Should see warning message in Bengali:
   "কোনো পেমেন্ট মেথড এভেইলেবল নেই। দয়া করে সাপোর্টে যোগাযোগ করুন।"
5. Pay Now button should be disabled
6. Button text should say "No Payment Methods Available"

---

## 4️⃣ TEST END-TO-END FLOW

### Complete User Journey:

1. **Admin disables bKash:**
   - Login to admin dashboard
   - Go to Settings
   - Disable bKash toggle
   - Click Save
   - See success message

2. **User opens app:**
   - Open Flutter app
   - Navigate to Subscription screen
   - App calls `/api/subscription/payment-methods`
   - bKash card should be hidden
   - Only Google Play card visible (if enabled)

3. **Admin enables bKash again:**
   - Go back to admin dashboard
   - Enable bKash toggle
   - Click Save

4. **User refreshes app:**
   - Close and reopen Subscription screen
   - bKash card should now be visible

---

## 5️⃣ COMMON ISSUES & SOLUTIONS

### Issue 1: Admin Dashboard Build Error
**Error**: `Module not found: Can't resolve '@/components/ui/switch'`

**Solution**: ✅ Already fixed! We removed the Switch component import and used custom checkbox styling instead.

### Issue 2: Backend Route Error
**Error**: `Route.get() requires a callback function but got a [object Undefined]`

**Solution**: ✅ Already fixed! We imported `getEnabledPaymentMethods` from adminController.

### Issue 3: Flutter App Not Showing Changes
**Problem**: Payment methods not updating in Flutter app

**Solution**:
1. Make sure backend is running
2. Check API URL in Flutter app (should be correct)
3. Try hot restart (not just hot reload)
4. Check console logs for API errors

### Issue 4: Settings Not Saving
**Problem**: Settings page shows success but doesn't save

**Solution**:
1. Check if admin is logged in (token valid)
2. Check browser console for errors
3. Check backend logs for errors
4. Verify MongoDB connection

---

## 6️⃣ VERIFICATION CHECKLIST

### Backend:
- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] GET /api/admin/payment-settings works
- [ ] PUT /api/admin/payment-settings works
- [ ] GET /api/subscription/payment-methods works

### Admin Dashboard:
- [ ] Dashboard starts without errors
- [ ] Settings page loads
- [ ] Toggle switches work
- [ ] Status indicators update
- [ ] Save button works
- [ ] Reset button works
- [ ] Success/error toasts show

### Flutter App:
- [ ] App starts without errors
- [ ] Subscription screen loads
- [ ] Payment methods load from API
- [ ] Only enabled methods shown
- [ ] Warning shows when no methods enabled
- [ ] Pay Now button disabled when no methods

### End-to-End:
- [ ] Admin changes settings → Flutter app updates
- [ ] Both methods enabled → Both shown
- [ ] One method enabled → Only that one shown
- [ ] No methods enabled → Warning shown + button disabled

---

## 📊 TEST RESULTS TEMPLATE

```
Date: ___________
Tester: ___________

Backend Tests:
[ ] Get payment settings - PASS/FAIL
[ ] Update payment settings - PASS/FAIL
[ ] Get enabled methods (public) - PASS/FAIL

Admin Dashboard Tests:
[ ] Settings page loads - PASS/FAIL
[ ] bKash toggle works - PASS/FAIL
[ ] Google Play toggle works - PASS/FAIL
[ ] Save button works - PASS/FAIL
[ ] Reset button works - PASS/FAIL

Flutter App Tests:
[ ] Payment methods load - PASS/FAIL
[ ] Conditional visibility works - PASS/FAIL
[ ] Warning message shows - PASS/FAIL
[ ] Button disabled when no methods - PASS/FAIL

End-to-End Tests:
[ ] Admin changes → App updates - PASS/FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎯 NEXT STEPS AFTER TESTING

1. If all tests pass:
   - Deploy admin dashboard to production
   - Build Flutter app APK/AAB
   - Upload to Google Play Store

2. If tests fail:
   - Document the issue
   - Check error logs
   - Fix the issue
   - Re-test

---

**Happy Testing! 🚀**
