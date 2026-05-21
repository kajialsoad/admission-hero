import mongoose from 'mongoose';
import User from '../models/User';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admission-hero';

export default async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Seed secure super admin account on startup if it doesn't exist
  try {
    const adminEmail = 'hero.admin2026@admissionhero.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Hero Admin',
        email: adminEmail,
        phone: '01711122233',
        password: 'AdmissionHero#2026!',
        role: 'admin',
        isVerified: true,
        isActive: true,
        subscriptionStatus: 'Premium'
      });
      console.log('✅ Secure Admin Account Created: hero.admin2026@admissionhero.com / AdmissionHero#2026!');
    }
  } catch (err) {
    console.error('Error seeding secure admin account:', err);
  }
}
