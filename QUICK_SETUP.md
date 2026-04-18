# Quick Setup Guide - Railway Deployment

## 🚀 Quick Steps

### 1. Deploy to Railway
```bash
# Login to Railway
railway login

# Go to backend folder
cd backend

# Initialize and deploy
railway init
railway up
```

### 2. Set Environment Variables on Railway
```bash
railway variables set PORT=5000
railway variables set MONGO_URI="mongodb+srv://adminhero:Munna301vps@cluster0.cb0snl1.mongodb.net/admission-hero?retryWrites=true&w=majority&appName=Cluster0"
railway variables set JWT_SECRET="your_super_secret_jwt_key_change_this_in_production_12345"
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
```

### 3. Get Your Railway URL
```bash
railway domain
```
Copy the URL (e.g., `https://your-app.up.railway.app`)

### 4. Update All Apps (Automatic)
```bash
# Windows
update-railway-url.bat https://your-app.up.railway.app

# Mac/Linux
chmod +x update-railway-url.sh
./update-railway-url.sh https://your-app.up.railway.app
```

### 5. Test Everything
```bash
# Test backend
curl https://your-app.up.railway.app/api/health

# Start admin dashboard
cd admin-dashboard
npm run dev

# Start mobile app
cd frontend
npx expo start
```

## 📋 Manual Update (if scripts don't work)

### Admin Dashboard (.env)
```env
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app/api
```

### Mobile App (.env)
```env
EXPO_PUBLIC_API_URL=https://your-app.up.railway.app/api
```

## ✅ Verification Checklist

- [ ] Railway backend deployed successfully
- [ ] Environment variables set on Railway
- [ ] MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- [ ] Backend health check works: `/api/health`
- [ ] Admin dashboard connects to Railway backend
- [ ] Mobile app connects to Railway backend
- [ ] Can login to admin dashboard
- [ ] Can register/login in mobile app

## 🔗 Important URLs

- Railway Dashboard: https://railway.app/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- Your Backend: https://your-app.up.railway.app
- Backend Health: https://your-app.up.railway.app/api/health

## 🆘 Common Issues

**Backend not starting?**
- Check Railway logs in dashboard
- Verify environment variables

**Connection timeout?**
- Check MongoDB Atlas IP whitelist
- Verify Railway URL is correct

**CORS errors?**
- Already configured in backend
- Check browser console for details

## 📞 Support

If you need help:
1. Check Railway deployment logs
2. Check browser console (F12)
3. Verify all environment variables
4. Test backend health endpoint
