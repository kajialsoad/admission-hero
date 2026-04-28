const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection string from environment
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  process.exit(1);
}

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscriptionStatus: { type: String, enum: ['inactive', 'active', 'expired'], default: 'inactive' },
  subscriptionExpiry: Date,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

async function createUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123456', 10);
    const userPassword = await bcrypt.hash('user123456', 10);

    // Create Admin User
    const adminUser = {
      name: 'Admin User',
      email: 'admin@admissionhero.com',
      phone: '01700000000',
      password: adminPassword,
      role: 'admin',
      subscriptionStatus: 'active',
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    };

    // Create Test User
    const testUser = {
      name: 'Test User',
      email: 'user@admissionhero.com',
      phone: '01700000001',
      password: userPassword,
      role: 'user',
      subscriptionStatus: 'active',
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    // Delete existing users if any
    await User.deleteMany({ email: { $in: ['admin@admissionhero.com', 'user@admissionhero.com'] } });

    // Insert users
    await User.insertMany([adminUser, testUser]);

    console.log('\n✅ Users created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 ADMIN LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email/Phone: admin@admissionhero.com');
    console.log('Password:    admin123456');
    console.log('Role:        admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 TEST USER LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email/Phone: user@admissionhero.com');
    console.log('Password:    user123456');
    console.log('Role:        user');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
}

createUsers();
