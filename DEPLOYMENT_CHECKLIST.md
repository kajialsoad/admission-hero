# 🚀 Railway Deployment Checklist

Use this checklist to ensure successful deployment of Admission Hero to Railway.

## Pre-Deployment

### Railway Account Setup
- [ ] Created Railway account at https://railway.app
- [ ] Connected GitHub account to Railway
- [ ] Installed Railway CLI: `npm install -g @railway/cli`
- [ ] Logged in to Railway CLI: `railway login`

### MongoDB Atlas Setup
- [ ] MongoDB Atlas account is active
- [ ] Database connection string is available
- [ ] Network Access configured:
  - [ ] Added IP: 0.0.0.0/0 (Allow from anywhere)
  - [ ] Confirmed and saved

### Local Environment
- [ ] Node.js is installed (v16 or higher)
- [ ] npm is working
- [ ] All dependencies installed:
  - [ ] `cd backend && npm install`
  - [ ] `cd admin-dashboard && npm install`
  - [ ] `cd frontend && npm install`

## Backend Deployment

### Deploy to Railway
- [ ] Navigated to backend folder: `cd backend`
- [ ] Initialized Railway project: `railway init`
- [ ] Deployed backend: `railway up`
- [ ] Deployment completed successfully
- [ ] No errors in Railway logs

### Environment Variables
Set these on Railway (via CLI or dashboard):
- [ ] `PORT=5000`
- [ ] `MONGO_URI=mongodb+srv://...` (your connection string)
- [ ] `JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345`
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `NODE_ENV=production`

### Get Railway URL
- [ ] Ran: `railway domain`
- [ ] Copied Railway URL (e.g., `https://your-app.up.railway.app`)
- [ ] Saved URL for next steps

## Backend Verification

### Health Check
- [ ] Visited: `https://your-app.up.railway.app/api/health`
- [ ] Received response: `{"status":"ok","timestamp":"..."}`
- [ ] No errors in browser console

### API Endpoints
Test these endpoints (replace with your Railway URL):
- [ ] `GET /api/health` - Returns 200 OK
- [ ] `POST /api/auth/register` - Accepts registration
- [ ] `POST /api/auth/login` - Accepts login
- [ ] `GET /api/universities` - Returns universities list

## Admin Dashboard Configuration

### Update Environment
- [ ] Opened `admin-dashboard/.env`
- [ ] Updated `NEXT_PUBLIC_API_URL` with Railway URL
- [ ] Format: `https://your-app.up.railway.app/api`
- [ ] Saved file

### Build and Test
- [ ] Ran: `cd admin-dashboard`
- [ ] Ran: `npm install`
- [ ] Ran: `npm run build` (no errors)
- [ ] Ran: `npm run dev`
- [ ] Opened: http://localhost:3000
- [ ] Admin login page loads
- [ ] Can login with admin credentials
- [ ] Dashboard loads data from Railway backend
- [ ] No CORS errors in console

## Mobile App Configuration

### Update Environment
- [ ] Opened `frontend/.env`
- [ ] Updated `EXPO_PUBLIC_API_URL` with Railway URL
- [ ] Format: `https://your-app.up.railway.app/api`
- [ ] Saved file

### Build and Test
- [ ] Ran: `cd frontend`
- [ ] Ran: `npm install`
- [ ] Ran: `npx expo start --clear`
- [ ] Scanned QR code / opened in emulator
- [ ] App loads successfully
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Data loads from Railway backend
- [ ] No network errors

## Final Verification

### Backend
- [ ] Railway deployment is "Active"
- [ ] No errors in Railway logs
- [ ] Health endpoint responding
- [ ] Database connection working
- [ ] All API endpoints functional

### Admin Dashboard
- [ ] Connects to Railway backend
- [ ] Login works
- [ ] Can view users
- [ ] Can view universities
- [ ] Can view questions
- [ ] Can create/edit/delete data
- [ ] Images upload successfully (if Cloudinary configured)

### Mobile App
- [ ] Connects to Railway backend
- [ ] Registration works
- [ ] Login works
- [ ] Can view universities
- [ ] Can take exams
- [ ] Can view results
- [ ] All features working

## Post-Deployment

### Documentation
- [ ] Saved Railway URL in secure location
- [ ] Documented environment variables
- [ ] Updated team with new backend URL
- [ ] Created backup of Railway configuration

### Monitoring
- [ ] Bookmarked Railway dashboard
- [ ] Set up Railway notifications (optional)
- [ ] Tested error logging
- [ ] Verified MongoDB Atlas monitoring

### Security
- [ ] Changed default JWT_SECRET to strong value
- [ ] Verified .env files not in git
- [ ] Confirmed HTTPS is working
- [ ] Tested authentication flow

### Optional Enhancements
- [ ] Set up custom domain on Railway
- [ ] Configure automatic deployments from GitHub
- [ ] Set up staging environment
- [ ] Enable Railway metrics and alerts
- [ ] Configure MongoDB Atlas backups

## Troubleshooting Completed

If you encountered issues, mark what you fixed:
- [ ] Fixed MongoDB connection issues
- [ ] Resolved CORS errors
- [ ] Fixed environment variable problems
- [ ] Resolved build errors
- [ ] Fixed network timeout issues

## Success Criteria

All these should be ✅ before considering deployment complete:
- [ ] Backend deployed and running on Railway
- [ ] Backend health check returns 200 OK
- [ ] Admin dashboard connects to Railway backend
- [ ] Admin can login and manage data
- [ ] Mobile app connects to Railway backend
- [ ] Users can register and login in mobile app
- [ ] All core features working end-to-end
- [ ] No console errors in any application
- [ ] Railway logs show no critical errors

---

## 🎉 Deployment Complete!

If all items are checked, congratulations! Your Admission Hero application is successfully deployed to Railway.

**Next Steps:**
1. Share Railway URL with your team
2. Test all features thoroughly
3. Monitor Railway logs for any issues
4. Plan for production scaling if needed

**Support:**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- MongoDB Atlas Support: https://support.mongodb.com

---

**Deployment Date:** _________________

**Railway URL:** _________________

**Deployed By:** _________________

**Notes:** 
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
