# Contact Information Setup Guide

## Overview
The contact information (email, phone, working hours) displayed in the mobile app's Help & Support page is now dynamically fetched from the backend API. This allows you to update contact details without rebuilding the app.

## Setup Instructions

### 1. Initialize Contact Information in Database

Run this command from the `backend` directory:

```bash
npm run init-contact-info
```

Or manually run:

```bash
npx ts-node src/scripts/initContactInfo.ts
```

This will create the initial contact information in your MongoDB database with default values:
- Email: support@admission-hero.com
- Phone: +880 1234 567890
- Working Hours: Mon-Sat, 9 AM - 6 PM

### 2. Update Contact Information

You have three ways to update the contact information:

#### Option A: Admin Dashboard (Recommended)
1. Log in to the admin dashboard
2. Go to **Settings** page
3. Find the **Contact Information** section at the top
4. Update the email, phone, and working hours
5. Click **Save Contact Info**

#### Option B: API Endpoint
Send a PUT request to `/api/settings`:

```bash
curl -X PUT http://your-api-url/api/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "contact_info",
    "value": {
      "email": "your-email@example.com",
      "phone": "+880 1XXX XXXXXX",
      "workingHours": "Sun-Thu, 10 AM - 8 PM"
    },
    "category": "public"
  }'
```

#### Option C: Direct Database Update
Connect to your MongoDB and update the `settings` collection:

```javascript
db.settings.updateOne(
  { key: "contact_info" },
  {
    $set: {
      value: {
        email: "your-email@example.com",
        phone: "+880 1XXX XXXXXX",
        workingHours: "Sun-Thu, 10 AM - 8 PM"
      }
    }
  }
)
```

### 3. Verify in Mobile App

1. Open the mobile app
2. Go to **Profile** → **Help & Support**
3. Scroll down to the **Contact Information** section
4. Verify that your updated information is displayed

## API Endpoints

### Get Contact Information (Public)
```
GET /api/settings/contact-info
```

Response:
```json
{
  "success": true,
  "data": {
    "email": "support@admission-hero.com",
    "phone": "+880 1234 567890",
    "workingHours": "Mon-Sat, 9 AM - 6 PM"
  }
}
```

### Update Settings (Admin Only)
```
PUT /api/settings
Authorization: Bearer <admin_token>
```

Request Body:
```json
{
  "key": "contact_info",
  "value": {
    "email": "new-email@example.com",
    "phone": "+880 1XXX XXXXXX",
    "workingHours": "Sun-Thu, 10 AM - 8 PM"
  },
  "category": "public"
}
```

## Files Changed

### Backend
- `backend/src/models/Settings.ts` - Settings model
- `backend/src/controllers/settingsController.ts` - Settings controller
- `backend/src/routes/settings.ts` - Settings routes
- `backend/src/app.ts` - Added settings route
- `backend/src/scripts/initContactInfo.ts` - Initialization script

### Flutter App
- `admission_hero_flutter/lib/models/contact_info.dart` - Contact info model
- `admission_hero_flutter/lib/services/settings_service.dart` - Settings service
- `admission_hero_flutter/lib/screens/profile/support_screen.dart` - Updated to fetch from API

### Admin Dashboard
- `admin-dashboard/src/app/dashboard/settings/page.tsx` - Added contact info section

## Troubleshooting

### Contact info not updating in app
1. Check if the backend API is running
2. Verify the API URL in Flutter app config
3. Check network connectivity
4. Look for errors in Flutter console

### Cannot save from admin dashboard
1. Verify you're logged in as admin
2. Check browser console for errors
3. Verify backend API is accessible
4. Check admin token is valid

### Default values showing
- The app will show default values if:
  - API is unreachable
  - Database doesn't have contact_info entry
  - Network error occurs

This is intentional to ensure the app always shows some contact information.

## Next Steps

Consider adding:
1. **Email integration** - Make the email button open the default email app
2. **Phone integration** - Make the phone button initiate a call
3. **Live chat** - The Live Chat button already navigates to ChatScreen
4. **More settings** - Add FAQ management, app version info, etc.

## Support

If you need help:
- Check backend logs for API errors
- Check Flutter console for network errors
- Verify MongoDB connection
- Ensure all environment variables are set correctly
