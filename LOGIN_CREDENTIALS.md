# 🔐 Login Credentials for Admission Hero

## 📱 **Admin Dashboard Login**
**URL:** https://munns-production.up.railway.app (Backend API)

### Admin Account:
```
Email/Phone: admin@admissionhero.com
Password:    admin123456
Role:        admin
```

**Admin can access:**
- Admin Dashboard
- User Management
- University Management
- Question Management
- Analytics
- All admin features

---

## 👤 **Flutter App / User Login**

### Test User Account:
```
Email/Phone: user@admissionhero.com
Password:    user123456
Role:        user
```

**User can access:**
- Take exams
- View results
- Performance tracking
- Subscription management
- All user features

---

## 🔑 **Alternative Login Methods**

Both accounts can login using:
- **Email**: admin@admissionhero.com or user@admissionhero.com
- **Phone**: 01700000000 (admin) or 01700000001 (user)

---

## 🌐 **API Endpoints**

### Backend API:
```
https://munns-production.up.railway.app/api
```

### Test Login:
```bash
# Admin Login
curl -X POST https://munns-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneOrEmail":"admin@admissionhero.com","password":"admin123456"}'

# User Login
curl -X POST https://munns-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneOrEmail":"user@admissionhero.com","password":"user123456"}'
```

---

## 📊 **Account Details**

### Admin Account:
- **Name:** Admin User
- **Email:** admin@admissionhero.com
- **Phone:** 01700000000
- **Role:** admin
- **Subscription:** Active (1 year)
- **Access:** Full admin privileges

### Test User Account:
- **Name:** Test User
- **Email:** user@admissionhero.com
- **Phone:** 01700000001
- **Role:** user
- **Subscription:** Active (30 days)
- **Access:** All user features

---

## 🔒 **Security Notes**

⚠️ **IMPORTANT:** These are test credentials for development/testing purposes.

**For Production:**
1. Change all default passwords
2. Use strong, unique passwords
3. Enable 2FA if available
4. Regularly rotate credentials
5. Monitor login activity

---

## 🚀 **Quick Start**

### Admin Dashboard:
1. Open admin dashboard URL
2. Login with admin credentials
3. Access admin panel

### Flutter App:
1. Open Flutter app
2. Login with user credentials
3. Start taking exams

---

## 📝 **Notes**

- Both accounts have active subscriptions
- Admin account never expires
- User account expires in 30 days
- You can create more users through admin dashboard
- Passwords are securely hashed with bcrypt

**Created:** April 23, 2026
**Status:** ✅ Active and Ready to Use