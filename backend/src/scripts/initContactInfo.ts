import mongoose from 'mongoose';
import Settings from '../models/Settings';
import dotenv from 'dotenv';

dotenv.config();

const initContactInfo = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables');
      console.error('Please set MONGODB_URI or MONGO_URI in your .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Initialize contact information
    await Settings.findOneAndUpdate(
      { key: 'contact_info' },
      {
        key: 'contact_info',
        category: 'public',
        value: {
          email: 'support@admission-hero.com',
          phone: '+880 1234 567890',
          workingHours: 'Mon-Sat, 9 AM - 6 PM',
        },
      },
      { upsert: true, new: true }
    );

    console.log('✅ Contact information initialized successfully');
    console.log('\nYou can now update these values through:');
    console.log('1. Admin dashboard (recommended)');
    console.log('2. Direct database update');
    console.log('3. API endpoint: PUT /api/settings');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing contact info:', error);
    process.exit(1);
  }
};

initContactInfo();
