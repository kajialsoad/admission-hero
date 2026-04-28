# 🚂 Railway Cloudinary Setup Instructions

## ✅ **Cloudinary Credentials Verified & Working**

আপনার Cloudinary credentials (tested and working):
- **Cloud Name**: `dnnph56pc`
- **API Key**: `494488329393457`
- **API Secret**: `h00QzrhWvKWqClWX6AqIH7i2XYk`

**Local Test Result**: ✅ Connection successful!

---

## 🚀 **Railway এ Add করুন (2 মিনিট)**

### **Step-by-Step Instructions:**

1. **Railway Dashboard এ যান**
   - Link: https://railway.app/dashboard
   - Login করুন

2. **Project Select করুন**
   - Project name: `munns-production`
   - Backend service এ click করুন

3. **Variables Tab এ যান**
   - উপরে "Variables" tab দেখবেন
   - Click করুন

4. **এই তিনটি Variable Add করুন**
   
   **Variable 1:**
   ```
   Name:  CLOUDINARY_CLOUD_NAME
   Value: dnnph56pc
   ```
   
   **Variable 2:**
   ```
   Name:  CLOUDINARY_API_KEY
   Value: 494488329393457
   ```
   
   **Variable 3:**
   ```
   Name:  CLOUDINARY_API_SECRET
   Value: h00QzrhWvKWqClWX6AqIH7i2XYk
   ```

5. **Deploy করুন**
   - Variables add করার পর automatic deploy হবে
   - অথবা "Deploy" button click করুন
   - 1-2 মিনিট wait করুন

---

### **Method 2: Railway CLI (Advanced)**

যদি Railway CLI install করা থাকে:

```bash
# Railway CLI দিয়ে
railway variables set CLOUDINARY_CLOUD_NAME=dqz3loeay
railway variables set CLOUDINARY_API_KEY=494488329393457
railway variables set CLOUDINARY_API_SECRET=h00QzrhWvKWqClWX6AqIH7i2XYk

# Deploy
railway up
```

---

## ✅ **Verification Steps**

### **Step 1: Check Railway Logs**
1. Railway Dashboard > Your Service > Deployments
2. Latest deployment এ click করুন
3. Logs দেখুন
4. দেখবেন: `Server running on port 5000` ✅

### **Step 2: Test Backend API**
```bash
# Test if backend is running
curl https://munns-production.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-23T..."
}
```

### **Step 3: Test Image Upload**

1. **Admin Dashboard এ Login করুন**
   - URL: https://munns-production.up.railway.app/dashboard
   - Email: `admin@admissionhero.com`
   - Password: `admin123456`

2. **Universities Section এ যান**
   - Left sidebar > Universities

3. **Add University Click করুন**
   - "Add University" button

4. **Logo Upload করুন**
   - "Upload University Logo" এ click করুন
   - একটা image select করুন (max 10MB)
   - Wait করুন upload হওয়ার জন্য

5. **Success Message দেখুন**
   - ✅ "Logo uploaded successfully!"
   - Image preview দেখবেন

6. **University Save করুন**
   - Name দিন: "Test University"
   - "Create University" click করুন

7. **Verify করুন**
   - University list এ logo দেখবেন
   - Logo click করলে full image দেখবেন

---

## 🎯 **Expected Results**

### **✅ Success Indicators:**
1. Railway deployment successful
2. Backend logs show no Cloudinary errors
3. Image upload shows success message
4. Image appears in university list
5. Image URL starts with: `https://res.cloudinary.com/dqz3loeay/...`

### **❌ If Something Goes Wrong:**

**Error: "Cloudinary configuration is missing"**
- Check Railway variables are added correctly
- Check spelling of variable names (case-sensitive)
- Redeploy the service

**Error: "Invalid API credentials"**
- Verify API Key and Secret are correct
- No extra spaces in values
- Check Cloudinary dashboard for correct credentials

**Error: "Failed to upload image"**
- Check file size (max 10MB)
- Check file type (only images: jpg, png, gif, webp)
- Check internet connection
- Check Railway logs for detailed error

---

## 📊 **Cloudinary Dashboard Check**

After successful upload:

1. **Go to Cloudinary Dashboard**
   - https://cloudinary.com/console
   - Login with your account

2. **Check Media Library**
   - Left sidebar > Media Library
   - Navigate to: `admission-hero/images/`
   - You should see uploaded images

3. **Check Usage**
   - Dashboard > Usage
   - See how much storage used
   - Free tier: 25GB available

---

## 🔒 **Security Notes**

### **✅ What We Did Right:**
- API keys stored in environment variables (not in code)
- Backend handles upload (not client-side)
- JWT authentication required
- File type and size validation

### **⚠️ Important:**
- Never commit `.env` file to git
- Never share API Secret publicly
- Keep Railway variables secure
- Only admins can upload images

---

## 📝 **Quick Checklist**

- [ ] Railway Dashboard opened
- [ ] Project `munns-production` selected
- [ ] Variables tab opened
- [ ] `CLOUDINARY_CLOUD_NAME` added
- [ ] `CLOUDINARY_API_KEY` added
- [ ] `CLOUDINARY_API_SECRET` added
- [ ] Deploy button clicked
- [ ] Deployment successful (check logs)
- [ ] Admin dashboard login successful
- [ ] Image upload tested
- [ ] Success message received
- [ ] Image appears in list

---

## 🎉 **After Setup Complete**

You can now:
- ✅ Upload university logos
- ✅ Upload question images
- ✅ Upload profile pictures
- ✅ All images optimized automatically
- ✅ Fast CDN delivery
- ✅ 25GB free storage

---

## 📞 **Need Help?**

If you face any issues:
1. Check Railway deployment logs
2. Check browser console (F12)
3. Verify all three variables are added
4. Try redeploying the service
5. Let me know, I'll help!

---

**Status**: ⏳ Waiting for Railway variables to be added
**Time Required**: 2 minutes
**Next Step**: Add variables to Railway and test upload

**আপনি Railway এ variables add করার পর আমাকে জানান, আমি verify করে দেব! 🚀**
