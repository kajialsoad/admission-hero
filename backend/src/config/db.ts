import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admission-hero';

export default async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
}
