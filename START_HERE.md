# 🚀 Start Here - Railway Deployment

Welcome! This guide will help you deploy your Admission Hero backend to Railway and connect everything together.

## 📋 What You'll Accomplish

By following this guide, you will:
1. ✅ Deploy backend to Railway (cloud hosting)
2. ✅ Connect admin dashboard to Railway backend
3. ✅ Connect mobile app to Railway backend
4. ✅ Test everything end-to-end

**Time Required:** 15-20 minutes

---

## 🎯 Choose Your Path

### 🚄 Fast Track (Recommended)
**For those who want to get up and running quickly**

1. Read: [QUICK_SETUP.md](./QUICK_SETUP.md)
2. Follow: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
3. Use scripts: `update-railway-url.sh` or `update-railway-url.bat`

### 📚 Detailed Path
**For those who want to understand every step**

1. Read: [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)
2. Follow: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### 🇧🇩 বাংলা গাইড
**বাংলায় সম্পূর্ণ নির্দেশনা**

1. পড়ুন: [RAILWAY_SETUP_BANGLA.md](./RAILWAY_SETUP_BANGLA.md)
2. অনুসরণ করুন: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## 🛠️ Prerequisites

Before you start, make sure you have:

- [ ] **Node.js** installed (v16 or higher)
  - Check: `node --version`
  - Download: https://nodejs.org

- [ ] **Railway Account** (free)
  - Sign up: https://railway.app
  - Use GitHub to sign in

- [ ] **MongoDB Atlas** (already configured)
  - Your connection string is in `backend/.env`

- [ ] **Git** installed
  - Check: `git --version`

---

## 🚀 Quick Start (5 Commands)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Deploy backend
cd backend
railway init
railway up

# 4. Set environment variables (copy from backend/.env)
railway variables set PORT=5000
railway variables set MONGO_URI="your_mongodb_connection_string"
railway variables set JWT_SECRET="your_jwt_secret"
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production

# 5. Get your Railway URL
railway domain
```

**Copy the Railway URL** (e.g., `https://your-app.up.railway.app`)

Then update your apps:

```bash
# Windows
update-railway-url.bat https://your-app.up.railway.app

# Mac/Linux
./update-railway-url.sh https://your-app.up.railway.app
```

---

## 📁 Important Files

### Configuration Files
- `backend/.env` - Backend environment variables
- `admin-dashboard/.env` - Admin dashboard configuration
- `frontend/.env` - Mobile app configuration

### Deployment Files (Created for You)
- `backend/Procfile` - Railway start command
- `backend/railway.toml` - Railway configuration
- `update-railway-url.sh` - Auto-update script (Mac/Linux)
- `update-railway-url.bat` - Auto-update script (Windows)
- `check-railway-setup.sh` - Configuration checker

### Documentation
- `README_DEPLOYMENT.md` - Complete deployment guide
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Detailed English guide
- `RAILWAY_SETUP_BANGLA.md` - বাংলা গাইড
- `QUICK_SETUP.md` - Quick reference
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

---

## ✅ Verification Steps

After deployment, verify everything works:

### 1. Test Backend
```bash
curl https://your-app.up.railway.app/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### 2. Test Admin Dashboard
```bash
cd admin-dashboard
npm run dev
```
- Open http://localhost:3000
- Login with admin credentials
- Check if data loads

### 3. Test Mobile App
```bash
cd frontend
npx expo start
```
- Scan QR code
- Try registration/login
- Check if data loads

---

## 🆘 Need Help?

### Common Issues

**Backend not starting?**
- Check Railway logs: `railway logs`
- Verify environment variables

**Connection timeout?**
- Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
- Verify Railway URL is correct

**CORS errors?**
- Already configured in backend
- Check browser console for details

### Get Support

1. **Check Documentation**
   - Read the detailed guides
   - Follow the checklist

2. **Check Railway Logs**
   ```bash
   cd backend
   railway logs
   ```

3. **Verify Configuration**
   ```bash
   ./check-railway-setup.sh https://your-app.up.railway.app
   ```

4. **Railway Support**
   - Docs: https://docs.railway.app
   - Discord: https://discord.gg/railway

---

## 🎯 Success Checklist

You're done when:
- [ ] Backend is running on Railway
- [ ] Health check returns 200 OK
- [ ] Admin dashboard connects to Railway
- [ ] Mobile app connects to Railway
- [ ] Can login to admin dashboard
- [ ] Can register/login in mobile app

---

## 📞 What's Next?

After successful deployment:

1. **Share with Team**
   - Share Railway URL
   - Update documentation

2. **Monitor**
   - Check Railway dashboard regularly
   - Monitor MongoDB Atlas usage

3. **Enhance** (Optional)
   - Add custom domain
   - Set up staging environment
   - Configure auto-deployments

---

## 🌟 Ready to Deploy?

Choose your path above and start deploying!

**Recommended:** Start with [QUICK_SETUP.md](./QUICK_SETUP.md) for the fastest deployment.

---

**Questions?** Check the detailed guides or Railway documentation.

**Good luck! 🚀**
