# Deploy Backend to Railway

## Step 1: Railway Setup
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `kajialsoad/admission-hero` repository
5. Select **backend** folder as root directory

## Step 2: Environment Variables
Add these in Railway dashboard → Variables:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://adminhero:Munna301vps@cluster0.cb0snl1.mongodb.net/admission-hero?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRES_IN=7d
```

## Step 3: Deploy
Railway will automatically:
- Install dependencies (`npm install`)
- Build TypeScript (`npm run build`)
- Start server (`npm start`)

## Step 4: Get Domain
After deployment, Railway will provide a domain like:
`https://your-backend-name.railway.app`

## Step 5: Test API
Test these endpoints:
- GET `https://your-backend-name.railway.app/api/health`
- POST `https://your-backend-name.railway.app/api/auth/register`
- POST `https://your-backend-name.railway.app/api/auth/login`

## Troubleshooting
- Check Railway logs if deployment fails
- Verify MongoDB connection string
- Ensure all environment variables are set correctly