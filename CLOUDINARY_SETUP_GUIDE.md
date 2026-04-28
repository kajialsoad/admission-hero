# Cloudinary Setup Guide for Image Uploads

## 🎯 **What is Cloudinary?**
Cloudinary is a cloud-based image and video management service that handles image uploads, storage, optimization, and delivery.

## 📋 **Why Do We Need It?**
The admin dashboard needs to upload university logos and other images. Instead of storing images on the server, we use Cloudinary for:
- ✅ Unlimited storage
- ✅ Automatic image optimization
- ✅ Fast CDN delivery
- ✅ Image transformations (resize, crop, etc.)
- ✅ Free tier available

---

## 🚀 **How to Set Up Cloudinary (FREE)**

### **Step 1: Create a Cloudinary Account**
1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with your email or Google account
3. Verify your email address
4. Complete the registration

### **Step 2: Get Your Credentials**
After logging in, you'll see your dashboard:

1. **Cloud Name**: Found at the top of the dashboard
   - Example: `dxyz123abc`
   
2. **API Key**: Found in the "Account Details" section
   - Example: `123456789012345`
   
3. **API Secret**: Click "Reveal" next to API Secret
   - Example: `abcdefghijklmnopqrstuvwxyz123456`

### **Step 3: Add Credentials to Backend**

Open `backend/.env` and update these values:

```env
# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Replace with your actual values:**
```env
# Example (use your own values!)
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### **Step 4: Update Railway Environment Variables**

Since your backend is deployed on Railway, you need to add these environment variables there too:

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project: `munns-production`
3. Click on your backend service
4. Go to **Variables** tab
5. Add these three variables:
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your API key
   - `CLOUDINARY_API_SECRET` = your API secret
6. Click **Deploy** to restart with new variables

---

## ✅ **How It Works Now**

### **Before (Not Working)**
```
Admin Dashboard → Direct Upload to Cloudinary → ❌ Missing Credentials
```

### **After (Working)**
```
Admin Dashboard → Backend API → Cloudinary → ✅ Image Uploaded
                 (with auth)    (with credentials)
```

### **Upload Flow:**
1. Admin selects an image in the dashboard
2. Image is sent to backend API: `POST /api/uploads/image`
3. Backend authenticates the request (JWT token)
4. Backend uploads to Cloudinary using credentials
5. Cloudinary returns the image URL
6. Backend sends URL back to admin dashboard
7. Dashboard saves the URL in the database

---

## 🔧 **Technical Details**

### **Backend Upload Endpoint**
```typescript
POST /api/uploads/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- image: File (max 10MB)
```

### **Response**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/dxyz123abc/image/upload/v1234567890/admission-hero/images/abc123.jpg",
    "publicId": "admission-hero/images/abc123",
    "width": 800,
    "height": 600,
    "format": "jpg",
    "size": 123456
  }
}
```

### **Image Storage Structure**
All images are stored in folders:
- University logos: `admission-hero/images/`
- Documents: `admission-hero/documents/`

### **Image Optimization**
Images are automatically optimized:
- Max width: 1200px
- Max height: 800px
- Quality: Auto (Cloudinary optimizes)
- Format: Original format preserved

---

## 🎨 **Free Tier Limits**

Cloudinary's free tier includes:
- ✅ **25 GB** storage
- ✅ **25 GB** monthly bandwidth
- ✅ **25,000** transformations per month
- ✅ Unlimited images
- ✅ CDN delivery

**This is more than enough for your admission hero project!**

---

## 🧪 **Testing the Upload**

### **Test 1: Upload from Admin Dashboard**
1. Login to admin dashboard: `https://munns-production.up.railway.app/dashboard`
2. Go to **Universities** section
3. Click **Add University**
4. Upload a logo image
5. ✅ Should see "Logo uploaded successfully!"

### **Test 2: Check Cloudinary Dashboard**
1. Go to [Cloudinary Media Library](https://cloudinary.com/console/media_library)
2. Navigate to `admission-hero/images/` folder
3. ✅ Should see your uploaded image

### **Test 3: Verify Image URL**
1. After upload, check the university in the database
2. The `logo` field should contain a Cloudinary URL
3. Open the URL in browser
4. ✅ Should display the image

---

## 🐛 **Troubleshooting**

### **Error: "Cloudinary configuration is missing"**
**Solution**: Add credentials to `backend/.env` and Railway environment variables

### **Error: "Authentication required"**
**Solution**: Make sure you're logged in to the admin dashboard

### **Error: "Failed to upload image"**
**Possible causes:**
1. Invalid Cloudinary credentials
2. File size too large (max 10MB)
3. Invalid file type (only images allowed)
4. Network connection issue

### **Error: "Invalid API Key"**
**Solution**: Double-check your API key and secret in Railway variables

---

## 📝 **Current Status**

### **✅ What's Done**
- Backend upload API created (`/api/uploads/image`)
- Admin dashboard updated to use backend API
- Authentication integrated
- Image optimization configured
- Error handling implemented

### **⏳ What You Need to Do**
1. Create Cloudinary account (FREE)
2. Get your credentials (Cloud Name, API Key, API Secret)
3. Add credentials to `backend/.env` (for local testing)
4. Add credentials to Railway environment variables (for production)
5. Test image upload in admin dashboard

---

## 🎉 **After Setup**

Once you add the Cloudinary credentials:
- ✅ Admin can upload university logos
- ✅ Images are stored in the cloud
- ✅ Fast image delivery via CDN
- ✅ Automatic image optimization
- ✅ No server storage needed

---

## 📞 **Need Help?**

If you face any issues:
1. Check Railway logs for backend errors
2. Check browser console for frontend errors
3. Verify Cloudinary credentials are correct
4. Make sure Railway variables are deployed

---

**Last Updated**: April 23, 2026
**Status**: ⏳ Waiting for Cloudinary credentials
