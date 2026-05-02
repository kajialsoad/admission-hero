# 🎯 Admin User Management - Complete Guide

## ✅ Feature Implemented

Admin can now **manually manage user subscriptions** from the admin panel!

---

## 🔧 Backend API

### Endpoint:
```
PUT /api/admin/users/:userId/subscription
```

### Headers:
```
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

### Request Body:
```json
{
  "subscriptionStatus": "paid",  // "free" or "paid"
  "subscriptionType": "3-month"  // "1-month", "3-month", or "6-month"
}
```

### Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "User Name",
    "subscriptionStatus": "paid",
    "subscriptionType": "3-month",
    "subscriptionExpireAt": "2024-06-15T10:30:00.000Z"
  },
  "message": "User subscription updated successfully"
}
```

---

## 🎨 Admin Panel Usage

### Step 1: Login to Admin Panel
```
http://localhost:3000
```

### Step 2: Go to Users Page
Click on **"User Manage"** in the sidebar

### Step 3: Find User
- Use search bar to find user by name/phone/email
- Or scroll through the list

### Step 4: Manage Subscription
1. Click the **Edit (pencil icon)** button next to the user
2. A modal will open with subscription options
3. Select:
   - **Subscription Type:** Free User or Paid User
   - **Plan Duration:** 1 Month, 3 Months, or 6 Months (if paid)
4. Click **"Update"** button

### Step 5: Verify
- User's subscription badge will update immediately
- Expiry date will be shown
- User can now access premium content in the app

---

## 📱 Flutter App - API Connection

### API Service Configuration:
**File:** `admission_hero_flutter/lib/utils/constants.dart`

```dart
static const String baseUrl = 'https://munns-production.up.railway.app/api';
```

### Subscription Service:
**File:** `admission_hero_flutter/lib/services/subscription_service.dart`

All subscription APIs are connected:
- ✅ Get Packages
- ✅ Validate Promo Code
- ✅ Calculate Price
- ✅ Check Subscription Status
- ✅ Get Subscription History
- ✅ Get Payment History
- ✅ Create bKash Payment

### Test API Connection:

1. **From Flutter App:**
```dart
// In any screen
final packages = await SubscriptionService().getPackages();
print('Packages: $packages');
```

2. **Test Subscription Check:**
```dart
final status = await SubscriptionService().checkSubscription();
print('Has Subscription: ${status?['hasSubscription']}');
```

---

## 🧪 Testing Guide

### Test 1: Make User Paid (Admin Panel)
1. Login to admin panel
2. Go to Users page
3. Find a test user
4. Click Edit button
5. Select "Paid User"
6. Select "3 Months"
7. Click Update
8. ✅ User should now have paid status

### Test 2: Verify in Flutter App
1. Login with the same user in Flutter app
2. Go to Subscription page
3. ✅ Should show "Active Subscription"
4. ✅ Should show expiry date
5. Try to access premium content
6. ✅ Should have access

### Test 3: Check Expiry
1. In admin panel, check user's expiry date
2. ✅ Should be 90 days from now (for 3 months)

### Test 4: Make User Free Again
1. In admin panel, edit user
2. Select "Free User"
3. Click Update
4. ✅ User should lose premium access

---

## 📊 Subscription Duration Mapping

| Plan Type | Duration | Days |
|-----------|----------|------|
| 1-month   | 30 days  | 30   |
| 3-month   | 90 days  | 90   |
| 6-month   | 180 days | 180  |

---

## 🔐 Access Control

### Backend Middleware:
**File:** `backend/src/middlewares/subscriptionCheck.ts`

```typescript
export const requireSubscription = async (req, res, next) => {
  // Checks if user has active subscription
  // Blocks access if subscription expired
}
```

### Usage in Routes:
```typescript
router.get('/premium-content', protect, requireSubscription, getContent);
```

---

## 📝 Database Records

### When Admin Makes User Paid:

1. **User Document Updated:**
```javascript
{
  subscriptionStatus: 'paid',
  subscriptionType: '3-month',
  subscriptionExpireAt: Date (90 days from now)
}
```

2. **Subscription Record Created:**
```javascript
{
  user: userId,
  packageName: '3-month (Admin Granted)',
  planId: '3-month',
  startAt: Date.now(),
  expireAt: Date (90 days from now),
  active: true,
  paymentMethod: 'admin',
  amount: 0,
  duration: 90
}
```

---

## 🎯 Use Cases

### 1. Free Trial
Admin can give users free trial:
- Select "Paid User"
- Select "1 Month"
- User gets 30 days free access

### 2. Promotional Access
Give premium access to specific users:
- Select "Paid User"
- Select "6 Months"
- User gets 180 days access

### 3. Customer Support
If user has payment issues:
- Admin can manually activate subscription
- User can continue using app

### 4. Revoke Access
If needed, admin can:
- Change user to "Free User"
- Access immediately revoked

---

## 🔄 API Flow

### Admin Makes User Paid:
```
1. Admin clicks Edit on user
2. Selects "Paid User" + "3 Months"
3. Clicks Update
4. Frontend sends PUT request to backend
5. Backend calculates expiry date (90 days)
6. Updates user document
7. Creates subscription record
8. Returns updated user data
9. Frontend shows success message
10. User badge updates to "Paid"
```

### User Checks Subscription in App:
```
1. User opens app
2. App calls /api/subscription/status
3. Backend checks user's subscriptionStatus
4. Backend checks subscriptionExpireAt
5. If expired, returns hasSubscription: false
6. If active, returns hasSubscription: true
7. App shows/hides premium content accordingly
```

---

## 🐛 Troubleshooting

### Issue: User still shows as Free after update
**Solution:** 
- Refresh the users page
- Check if API call was successful
- Check browser console for errors

### Issue: User can't access premium content
**Solution:**
- Check user's subscriptionExpireAt date
- Make sure it's in the future
- Check if app is using correct API URL

### Issue: Subscription expired immediately
**Solution:**
- Check backend date calculation
- Make sure timezone is correct
- Verify duration days are correct

---

## 📞 Support

If you face any issues:
- Check backend logs: `npm run dev` output
- Check admin panel console: F12 → Console
- Check Flutter app logs: `flutter run` output

---

## ✅ Summary

**Admin Panel:**
- ✅ Can view all users
- ✅ Can search users
- ✅ Can make users paid/free
- ✅ Can set subscription duration
- ✅ Can see expiry dates
- ✅ Can activate/deactivate users

**Flutter App:**
- ✅ API connected to backend
- ✅ Subscription service working
- ✅ Can check subscription status
- ✅ Can show premium content based on subscription
- ✅ Can handle expired subscriptions

**Backend:**
- ✅ Admin API working
- ✅ Subscription check middleware ready
- ✅ Database records properly created
- ✅ Expiry date calculation correct

---

**🎉 Admin User Management Feature Complete!**

Admin can now fully control user subscriptions from the admin panel! 🚀
