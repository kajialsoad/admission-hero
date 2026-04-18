# Admission Hero — Backend (Scaffold)

## What this contains
A modular TypeScript + Express + MongoDB (Mongoose) backend scaffold implementing core models, routes and controllers for:
- Users (mobile/email, OTP mock)
- Authentication (JWT)
- Universities, Units
- Exams, Questions, Videos
- Subscriptions, Payments (models + basic endpoints)
- Admin panel basics (role-based middleware)
- Bookmarking, search basics
- CSV export helper placeholder

## Quick start (locally)
1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in dev:
   ```bash
   npm run dev
   ```
4. Build & start:
   ```bash
   npm run build
   npm start
   ```

This scaffold is intended as a complete starting backend. Extend controllers and add validation, tests and production readiness as needed.
