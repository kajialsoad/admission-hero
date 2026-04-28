# 🖼️ Cloudinary Setup Guide (বাংলায়)

## ❓ **Cloudinary কি?**
Cloudinary হলো একটি cloud service যেখানে আপনি image upload করতে পারবেন। এটা দিয়ে:
- ✅ University logo upload করা যাবে
- ✅ Question এর image upload করা যাবে
- ✅ Automatic image optimization হবে
- ✅ Fast delivery (CDN)
- ✅ **সম্পূর্ণ FREE** (আপনার project এর জন্য যথেষ্ট)

---

## 🚀 **Setup করুন (মাত্র ৫ মিনিট)**

### **ধাপ ১: Account তৈরি করুন**

1. এই link এ যান: https://cloudinary.com/users/register/free
2. Sign up করুন:
   - Email দিয়ে
   - অথবা Google account দিয়ে
3. Email verify করুন (inbox check করুন)

### **ধাপ ২: Credentials নিন**

Login করার পর Dashboard এ দেখবেন:

```
┌─────────────────────────────────────┐
│  Product Environment Credentials    │
├─────────────────────────────────────┤
│  Cloud name:  dxyz123abc            │  ← এটা copy করুন
│  API Key:     123456789012345       │  ← এটা copy করুন
│  API Secret:  ************ [Reveal] │  ← Reveal click করে copy করুন
└─────────────────────────────────────┘
```

**তিনটি জিনিস copy করুন:**
1. **Cloud Name** (উপরে দেখাবে)
2. **API Key** (Account Details এ)
3. **API Secret** (Reveal button click করে দেখুন)

### **ধাপ ৩: Railway এ Add করুন**

1. Railway Dashboard এ যান: https://railway.app/dashboard
2. আপনার project select করুন: **munns-production**
3. Backend service এ click করুন
4. **Variables** tab এ যান
5. এই তিনটি variable add করুন:

```
Variable Name                    Value
─────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME     →     dxyz123abc (আপনার cloud name)
CLOUDINARY_API_KEY        →     123456789012345 (আপনার API key)
CLOUDINARY_API_SECRET     →     abcdef... (আপনার API secret)
```

6. **Deploy** button click করুন (backend restart হবে)

### **ধাপ ৪: Test করুন**

1. Admin Dashboard এ login করুন
2. **Universities** section এ যান
3. **Add University** click করুন
4. একটা logo image upload করুন
5. ✅ দেখবেন: **"Logo uploaded successfully!"**

---

## 📸 **Screenshot Guide**

### **Cloudinary Dashboard:**
```
┌──────────────────────────────────────────────┐
│  Cloudinary Dashboard                        │
├──────────────────────────────────────────────┤
│                                              │
│  Cloud name: dxyz123abc          ← Copy এটা │
│                                              │
│  Account Details:                            │
│  ├─ API Key: 123456789012345     ← Copy এটা │
│  └─ API Secret: [Reveal]         ← Click করে copy │
│                                              │
└──────────────────────────────────────────────┘
```

### **Railway Variables:**
```
┌──────────────────────────────────────────────┐
│  Railway > munns-production > Variables      │
├──────────────────────────────────────────────┤
│                                              │
│  [+ New Variable]                            │
│                                              │
│  CLOUDINARY_CLOUD_NAME = dxyz123abc          │
│  CLOUDINARY_API_KEY = 123456789012345        │
│  CLOUDINARY_API_SECRET = abcdef...           │
│                                              │
│  [Deploy]  ← এটা click করুন                 │
└──────────────────────────────────────────────┘
```

---

## ✅ **কি কি হবে Setup এর পর?**

### **Admin Dashboard থেকে:**
1. University logo upload করতে পারবেন
2. Question এর image upload করতে পারবেন
3. Profile picture upload করতে পারবেন

### **Automatic Features:**
- ✅ Image automatically optimize হবে
- ✅ Fast loading (CDN থেকে)
- ✅ Unlimited storage (free tier এ 25GB)
- ✅ Secure upload (authentication দিয়ে)

---

## 🎯 **Free Tier এ কি পাবেন?**

Cloudinary এর free plan এ:
- ✅ **25 GB** storage
- ✅ **25 GB** monthly bandwidth
- ✅ **25,000** image transformations/month
- ✅ Unlimited images upload
- ✅ CDN delivery
- ✅ Image optimization

**আপনার Admission Hero project এর জন্য এটা যথেষ্ট!**

---

## 🐛 **সমস্যা হলে?**

### **Error: "Cloudinary configuration is missing"**
**সমাধান**: Railway এ credentials add করেছেন কিনা check করুন

### **Error: "Authentication required"**
**সমাধান**: Admin dashboard এ login করুন

### **Error: "Failed to upload image"**
**সম্ভাব্য কারণ:**
1. Cloudinary credentials ভুল
2. File size বেশি (max 10MB)
3. File type ভুল (শুধু image allowed)
4. Internet connection সমস্যা

### **Image upload হচ্ছে না?**
**Check করুন:**
1. Railway variables সঠিক আছে কিনা
2. Backend deploy হয়েছে কিনা (Deploy button click করেছেন?)
3. Admin dashboard এ login করা আছে কিনা
4. Image file 10MB এর কম কিনা

---

## 📞 **Help দরকার?**

যদি কোনো সমস্যা হয়:
1. Railway logs check করুন (backend errors দেখার জন্য)
2. Browser console check করুন (F12 press করুন)
3. Cloudinary credentials আবার verify করুন
4. আমাকে জানান, আমি help করব!

---

## 🎬 **Quick Start (Summary)**

```
1. Cloudinary.com এ account তৈরি করুন (FREE)
   ↓
2. Cloud Name, API Key, API Secret copy করুন
   ↓
3. Railway > Variables এ add করুন
   ↓
4. Deploy button click করুন
   ↓
5. Admin Dashboard এ test করুন
   ↓
6. ✅ Done! Image upload কাজ করবে
```

---

## 📝 **Checklist**

Setup complete হয়েছে কিনা check করুন:

- [ ] Cloudinary account তৈরি করেছি
- [ ] Cloud Name copy করেছি
- [ ] API Key copy করেছি
- [ ] API Secret copy করেছি
- [ ] Railway Variables এ add করেছি
- [ ] Deploy button click করেছি
- [ ] Admin Dashboard এ login করেছি
- [ ] University logo upload test করেছি
- [ ] ✅ "Logo uploaded successfully!" দেখেছি

---

**Status**: ⏳ আপনার Cloudinary credentials এর অপেক্ষায়
**Time Required**: মাত্র ৫ মিনিট
**Cost**: সম্পূর্ণ FREE

**Setup করার পর আমাকে জানান, আমি verify করে দেব! 🚀**
