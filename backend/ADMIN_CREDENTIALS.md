# Admin Credentials

## Default Admin Account

After running the `create-admin` script, use these credentials to login:

```
📧 Email: admin@admissionhero.com
📱 Phone: 01700000000
🔑 Password: admin123456
```

## How to Create Admin User

### Step 1: Make sure MongoDB is running

**Option A: Local MongoDB**
- Install MongoDB from https://www.mongodb.com/try/download/community
- Start MongoDB service

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `MONGO_URI` in backend `.env` file

### Step 2: Run the script

```bash
cd backend
npm run create-admin
```

## Login to Admin Dashboard

1. Open http://localhost:3000
2. Enter email or phone: `admin@admissionhero.com` or `01700000000`
3. Enter password: `admin123456`
4. Click Sign In

## Change Admin Password

After first login, it's recommended to change the password from the admin dashboard.

---

**Note:** The script will check if admin already exists before creating a new one.
