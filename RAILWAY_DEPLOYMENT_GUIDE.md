# Railway Deployment Guide - Admission Hero Backend

## Step 1: Railway Account Setup

1. Go to [Railway.app](https://railway.app)
2. Click "Login" and sign in with GitHub
3. Authorize Railway to access your GitHub account

## Step 2: Deploy Backend to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   cd backend
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Create New Project on Railway**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` folder (Railway will auto-detect it)

3. **Configure Environment Variables**:
   - Go to your project → Variables tab
   - Add these variables:
     ```
     PORT=5000
     MONGO_URI=mongodb+srv://adminhero:Munna301vps@cluster0.cb0snl1.mongodb.net/admission-hero?retryWrites=true&w=majority&appName=Cluster0
     JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
     JWT_EXPIRES_IN=7d
     NODE_ENV=production
     ```

### Option B: Deploy with Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize and Deploy**:
   ```bash
   cd backend
   railway init
   railway up
   ```

4. **Add Environment Variables**:
   ```bash
   railway variables set PORT=5000
   railway variables set MONGO_URI="mongodb+srv://adminhero:Munna301vps@cluster0.cb0snl1.mongodb.net/admission-hero?retryWrites=true&w=majority&appName=Cluster0"
   railway variables set JWT_SECRET="your_super_secret_jwt_key_change_this_in_production_12345"
   railway variables set JWT_EXPIRES_IN=7d
   railway variables set NODE_ENV=production
   ```

## Step 3: Get Your Railway Backend URL

1. After deployment, Railway will provide a URL like:
   ```
   https://your-app-name.up.railway.app
   ```

2. Copy this URL - you'll need it for the next steps

## Step 4: Update Admin Dashboard Configuration

1. Open `admin-dashboard/.env`
2. Replace the API URL with your Railway URL:
   ```
   NEXT_PUBLIC_API_URL=https://your-app-name.up.railway.app/api
   ```

## Step 5: Update Mobile App Configuration

1. Open `frontend/.env`
2. Replace the API URL with your Railway URL:
   ```
   EXPO_PUBLIC_API_URL=https://your-app-name.up.railway.app/api
   ```

## Step 6: Rebuild and Test

### Admin Dashboard:
```bash
cd admin-dashboard
npm install
npm run build
npm start
```

### Mobile App:
```bash
cd frontend
npm install
# For Android
npx expo run:android
# For iOS
npx expo run:ios
```

## Step 7: Verify Connection

1. **Test Backend Health**:
   - Visit: `https://your-app-name.up.railway.app/api/health`
   - Should return: `{"status":"ok"}`

2. **Test Admin Login**:
   - Open admin dashboard
   - Try logging in with admin credentials

3. **Test Mobile App**:
   - Open the app
   - Try registering/logging in

## Troubleshooting

### Backend Not Starting:
- Check Railway logs: Project → Deployments → View Logs
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct

### CORS Issues:
- Make sure backend CORS is configured to allow your frontend domains
- Check `backend/src/app.ts` for CORS settings

### Connection Timeout:
- Verify Railway service is running
- Check if MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

## Important Notes

1. **MongoDB Atlas Whitelist**: 
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (Allow from anywhere)
   - This allows Railway to connect to your database

2. **Environment Variables**:
   - Never commit `.env` files to GitHub
   - Always use Railway's environment variables feature

3. **Custom Domain** (Optional):
   - Railway allows custom domains
   - Go to Settings → Domains to add your own domain

## Next Steps

After successful deployment:
- [ ] Update admin dashboard with Railway URL
- [ ] Update mobile app with Railway URL
- [ ] Test all API endpoints
- [ ] Monitor Railway logs for any issues
- [ ] Set up automatic deployments from GitHub
