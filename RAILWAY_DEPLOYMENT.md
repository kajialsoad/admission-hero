# Railway Deployment Guide

This guide will help you deploy both the frontend and backend of the Admission Hero project to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Environment Variables**: Prepare your environment variables

## Backend Deployment

### 1. Create New Project
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `admission-hero` repository
5. Select the `backend` folder as the root directory

### 2. Configure Environment Variables
Add these environment variables in Railway dashboard:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=your_frontend_domain
```

### 3. Deploy Settings
Railway will automatically detect the configuration from:
- `backend/railway.toml`
- `backend/Procfile`
- `backend/package.json`

The backend will be available at: `https://your-backend-name.railway.app`

## Frontend Deployment

### 1. Create Another Project
1. Create a new Railway project
2. Select "Deploy from GitHub repo"
3. Choose your `admission-hero` repository
4. Select the `frontend` folder as the root directory

### 2. Configure Environment Variables
Add these environment variables:

```env
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://your-backend-name.railway.app
```

### 3. Deploy Settings
Railway will use:
- `frontend/railway.toml`
- `frontend/Procfile`
- `frontend/package.json`

The frontend will be available at: `https://your-frontend-name.railway.app`

## Admin Dashboard Deployment (Optional)

### 1. Create Third Project
1. Create another Railway project
2. Select the `admin-dashboard` folder
3. Configure Next.js deployment

### 2. Environment Variables
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-name.railway.app
```

## Post-Deployment Steps

### 1. Update CORS Settings
Update your backend CORS configuration to include your Railway frontend domain:

```javascript
// In backend/src/app.ts
const corsOptions = {
  origin: [
    'https://your-frontend-name.railway.app',
    'https://your-admin-dashboard-name.railway.app'
  ],
  credentials: true
};
```

### 2. Update API URLs
Make sure your frontend is pointing to the correct backend URL:

```javascript
// In frontend - update API base URL
const API_BASE_URL = 'https://your-backend-name.railway.app';
```

### 3. Test Deployment
1. Visit your frontend URL
2. Test user registration/login
3. Test API endpoints
4. Verify database connections

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Railway build logs
   - Verify package.json scripts
   - Ensure all dependencies are listed

2. **Environment Variables**
   - Double-check variable names
   - Ensure no trailing spaces
   - Verify MongoDB connection string

3. **CORS Errors**
   - Update backend CORS settings
   - Add Railway domains to allowed origins

4. **Database Connection**
   - Verify MongoDB URI
   - Check network access settings
   - Ensure database user has proper permissions

## Railway CLI (Optional)

Install Railway CLI for easier management:

```bash
npm install -g @railway/cli
railway login
railway link
railway deploy
```

## Monitoring

- Check Railway dashboard for logs
- Monitor resource usage
- Set up alerts for downtime

Your Admission Hero application is now deployed on Railway! 🚀