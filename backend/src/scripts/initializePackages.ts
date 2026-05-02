import mongoose from 'mongoose';
import Package from '../models/Package';
import dotenv from 'dotenv';

dotenv.config();

const defaultPackages = [
  {
    type: '3_months',
    name: '3 Months Premium',
    durationDays: 90,
    price: 500,
    features: [
      'All Questions Access',
      'All Exams Access',
      'All Video Solutions',
      'Performance Analytics',
      'Priority Support'
    ],
    status: 'active'
  },
  {
    type: '6_months',
    name: '6 Months Premium',
    durationDays: 180,
    price: 900,
    features: [
      'All Questions Access',
      'All Exams Access',
      'All Video Solutions',
      'Performance Analytics',
      'Priority Support',
      '10% Discount'
    ],
    status: 'active'
  },
  {
    type: '12_months',
    name: '12 Months Premium',
    durationDays: 365,
    price: 1500,
    features: [
      'All Questions Access',
      'All Exams Access',
      'All Video Solutions',
      'Performance Analytics',
      'Priority Support',
      '25% Discount',
      'Lifetime Updates'
    ],
    status: 'active'
  }
];

async function initializePackages() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    
    if (!MONGO_URI) {
      console.error('MONGO_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if packages already exist
    const existingCount = await Package.countDocuments();
    
    if (existingCount > 0) {
      console.log(`${existingCount} packages already exist. Skipping initialization.`);
      console.log('If you want to reset, delete existing packages first.');
      process.exit(0);
    }

    // Create default packages
    await Package.insertMany(defaultPackages);
    console.log('✅ Default packages created successfully!');
    
    const packages = await Package.find();
    console.log('\nCreated Packages:');
    packages.forEach(pkg => {
      console.log(`- ${pkg.name}: ৳${pkg.price} (${pkg.durationDays} days)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error initializing packages:', error);
    process.exit(1);
  }
}

initializePackages();
