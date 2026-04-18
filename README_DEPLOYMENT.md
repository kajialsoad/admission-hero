# Admission Hero - Railway Deployment Guide

Complete guide to deploy your Admission Hero backend to Railway and connect it with Admin Dashboard and Mobile App.

## 📁 Project Structure

```
admission-hero/
├── backend/              # Express + TypeScript backend
├── admin-dashboard/      # Next.js admin panel
├── frontend/            # React Native mobile app
└── deployment files     # Railway setup scripts
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js installed
- Railway account (free tier available)
- MongoDB Atlas database (already configured)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```
This will open your browser for authentication.

### Step 3: Deploy Backend
```bash
cd backend
railway init
railway up
```

### Step 4: Set Environment Variables
```bash
railway variables set PORT=5000
railway variables set MONGO_URI="mongodb+srv://adminhero:Munna301vps@cluster0.cb0snl1.mongodb.net/admission-hero?retryWrites=true&w=majority&appName=Cluster0"
railway variables set JWT_SECRET="your_super_secret_jwt_key_change_this_in_production_12345"
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
```

### Step 5: Get Your Railway URL
```bash
railway domain
```
Copy the URL (e.g., `https://admission-hero-production.up.railway.app`)

### Step 6: Update All Apps
```bash
cd ..

# Windows
update-railway-url.bat https://your-railway-url.up.railway.app

# Mac/Linux
chmod +x update-railway-url.sh
./update-railway-url.sh https://your-railway-url.up.railway.app
```

### Step 7: Verify Setup
```bash
# Check configuration
chmod +x check-railway-setup.sh
./check-railway-setup.sh https://your-railway-url.up.railway.app
```

## 📚 Detailed Guides

- **[RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)** - Complete English guide
- **[RAILWAY_SETUP_BANGLA.md](./RAILWAY_SETUP_BANGLA.md)** - বাংলা গাইড
- **[QUICK_SETUP.md](./QUICK_SETUP.md)** - Quick reference

## 🛠️ Helper Scripts

### `update-railway-url.sh` / `update-railway-url.bat`
Automatically updates Railway URL in all projects.

**Usage:**
```bash
# Windows
update-railway-url.bat https://your-app.up.railway.app

# Mac/Linux
./update-railway-url.sh https://your-app.up.railway.app
```

### `check-railway-setup.sh`
Verifies your Railway deployment configuration.

**Usage:**
```bash
./check-railway-setup.sh https://your-app.up.railway.app
```

## 🔧 Manual Configuration

If scripts don't work, update manually:

### Admin Dashboard
Edit `admin-dashboard/.env`:
```env
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app/api
```

### Mobile App
Edit `frontend/.env`:
```env
EXPO_PUBLIC_API_URL=https://your-app.up.railway.app/api
```

## ✅ Testing

### Test Backend
```bash
curl https://your-app.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-18T..."
}
```

### Test Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev
```
Open http://localhost:3000 and try logging in.

### Test Mobile App
```bash
cd frontend
npm install
npx expo start
```
Scan QR code and test registration/login.

## 🔐 Security Checklist

- [ ] MongoDB Atlas IP whitelist set to 0.0.0.0/0
- [ ] JWT_SECRET is strong and unique
- [ ] Environment variables set on Railway (not in code)
- [ ] .env files are in .gitignore
- [ ] HTTPS is enabled (Railway provides this automatically)

## 📊 Monitoring

### View Railway Logs
```bash
cd backend
railway logs
```

Or visit: https://railway.app/dashboard → Your Project → Deployments → View Logs

### Check Backend Status
Visit: `https://your-app.up.railway.app/api/health`

## 🐛 Troubleshooting

### Backend Not Starting
1. Check Railway logs: `railway logs`
2. Verify environment variables in Railway dashboard
3. Ensure MongoDB connection string is correct

### Connection Timeout
1. Check MongoDB Atlas Network Access
2. Add IP: 0.0.0.0/0 (Allow from anywhere)
3. Verify Railway URL is correct

### CORS Errors
- Backend CORS is already configured
- Check browser console for specific errors
- Verify API URL in .env files

### Admin Dashboard Can't Connect
1. Check `admin-dashboard/.env` has correct Railway URL
2. Rebuild: `npm run build`
3. Clear browser cache
4. Check browser console for errors

### Mobile App Can't Connect
1. Check `frontend/.env` has correct Railway URL
2. Restart Expo: `npx expo start --clear`
3. Ensure phone/emulator has internet access
4. Check if Railway backend is running

## 🔄 Continuous Deployment

Railway automatically deploys when you push to GitHub:

1. Connect your GitHub repository to Railway
2. Railway will auto-deploy on every push to main branch
3. Monitor deployments in Railway dashboard

## 💰 Railway Pricing

- **Free Tier**: $5 credit/month (enough for development)
- **Pro Plan**: $20/month (for production)
- Backend typically uses ~$3-5/month on free tier

## 📞 Support

### Railway Support
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Project Issues
1. Check Railway logs
2. Check browser console (F12)
3. Verify environment variables
4. Test backend health endpoint

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Go to Railway → Settings → Domains
   - Add your custom domain

2. **Environment-Specific Configs**
   - Create separate Railway projects for staging/production
   - Use different MongoDB databases

3. **Monitoring**
   - Set up Railway alerts
   - Monitor API response times
   - Track error rates

4. **Backups**
   - Enable MongoDB Atlas automated backups
   - Export Railway environment variables

## 📝 Important Files

- `backend/Procfile` - Railway start command
- `backend/railway.toml` - Railway configuration
- `backend/src/app.ts` - Health check endpoint added
- `.env.example` files - Environment variable templates

## 🌟 Features

✅ Automatic HTTPS
✅ Auto-scaling
✅ Zero-downtime deployments
✅ Built-in monitoring
✅ Easy rollbacks
✅ Environment variables management

---

**Ready to deploy?** Start with [QUICK_SETUP.md](./QUICK_SETUP.md) for the fastest path to production!
