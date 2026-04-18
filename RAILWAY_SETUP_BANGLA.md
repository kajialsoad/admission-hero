# Railway Deployment Guide (বাংলা)

## ধাপ ১: Railway Account তৈরি করুন

1. [Railway.app](https://railway.app) এ যান
2. "Login" বাটনে ক্লিক করুন
3. GitHub দিয়ে সাইন ইন করুন
4. Railway কে আপনার GitHub অ্যাক্সেস দিন

## ধাপ ২: Backend Deploy করুন

### সহজ পদ্ধতি (GitHub থেকে):

1. **Railway Dashboard এ যান**:
   - "New Project" ক্লিক করুন
   - "Deploy from GitHub repo" সিলেক্ট করুন
   - আপনার repository খুঁজুন এবং সিলেক্ট করুন

2. **Environment Variables সেট করুন**:
   - Project এ ক্লিক করুন
   - "Variables" ট্যাবে যান
   - নিচের variables গুলো যোগ করুন:
   
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://adminhero:Munna301vps@cluster0.cb0snl1.mongodb.net/admission-hero?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   ```

3. **Deploy হওয়ার জন্য অপেক্ষা করুন**:
   - Railway automatically আপনার backend deploy করবে
   - "Deployments" ট্যাবে progress দেখতে পারবেন

## ধাপ ৩: Railway URL কপি করুন

1. Deploy সফল হলে, Railway একটি URL দেবে:
   ```
   https://your-app-name.up.railway.app
   ```

2. এই URL টি কপি করুন (পরে লাগবে)

## ধাপ ৪: MongoDB Atlas Setup

1. [MongoDB Atlas](https://cloud.mongodb.com) এ লগইন করুন
2. "Network Access" এ যান
3. "Add IP Address" ক্লিক করুন
4. "Allow Access from Anywhere" সিলেক্ট করুন (0.0.0.0/0)
5. "Confirm" ক্লিক করুন

## ধাপ ৫: Admin Dashboard Update করুন

1. `admin-dashboard/.env` ফাইল খুলুন
2. Railway URL দিয়ে আপডেট করুন:
   ```
   NEXT_PUBLIC_API_URL=https://your-app-name.up.railway.app/api
   ```

## ধাপ ৬: Mobile App Update করুন

1. `frontend/.env` ফাইল খুলুন
2. Railway URL দিয়ে আপডেট করুন:
   ```
   EXPO_PUBLIC_API_URL=https://your-app-name.up.railway.app/api
   ```

## ধাপ ৭: সহজ উপায়ে URL Update (Optional)

আপনি script ব্যবহার করে সব একসাথে আপডেট করতে পারেন:

**Windows এ:**
```bash
update-railway-url.bat https://your-app-name.up.railway.app
```

**Mac/Linux এ:**
```bash
chmod +x update-railway-url.sh
./update-railway-url.sh https://your-app-name.up.railway.app
```

## ধাপ ৮: Test করুন

### Backend Test:
আপনার browser এ যান:
```
https://your-app-name.up.railway.app/api/health
```

দেখতে পাবেন:
```json
{"status":"ok","timestamp":"2026-04-18T..."}
```

### Admin Dashboard Test:
```bash
cd admin-dashboard
npm install
npm run dev
```

Browser এ খুলুন: http://localhost:3000

### Mobile App Test:
```bash
cd frontend
npm install
npx expo start
```

## সমস্যা সমাধান

### Backend শুরু হচ্ছে না:
- Railway logs চেক করুন: Project → Deployments → View Logs
- Environment variables সঠিক আছে কিনা দেখুন

### Connection Error:
- MongoDB Atlas এ IP whitelist চেক করুন (0.0.0.0/0 থাকতে হবে)
- Railway URL সঠিক আছে কিনা দেখুন

### CORS Error:
- Backend এর CORS configuration ঠিক আছে (already configured)

## গুরুত্বপূর্ণ নোট

✅ **সফল Deploy এর জন্য চেকলিস্ট:**
- [ ] Railway account তৈরি হয়েছে
- [ ] Backend deploy হয়েছে
- [ ] Railway URL পেয়েছেন
- [ ] MongoDB Atlas IP whitelist করেছেন
- [ ] Admin dashboard .env আপডেট করেছেন
- [ ] Mobile app .env আপডেট করেছেন
- [ ] Backend health check কাজ করছে
- [ ] Admin login test করেছেন
- [ ] Mobile app test করেছেন

## সাহায্য প্রয়োজন?

যদি কোন সমস্যা হয়:
1. Railway logs দেখুন
2. Browser console চেক করুন
3. Network tab এ API calls দেখুন
4. MongoDB connection string verify করুন
