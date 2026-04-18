// Optional: script to create sample universities, units, and an admin user
import University from '../models/University';
import User from '../models/User';

export async function seed() {
  const u = await University.findOne({ name: 'Sample University' });
  if (!u) {
    await University.create({ name: 'Sample University', shortName: 'SU', units: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] });
    console.log('Sample university created');
  }
  const admin = await User.findOne({ email: 'admin@hero.test' });
  if (!admin) {
    await User.create({ name: 'Admin', email: 'admin@hero.test', password: 'admin123', role: 'admin', isVerified: true });
    console.log('Admin user created: admin@hero.test / admin123');
  }
}
