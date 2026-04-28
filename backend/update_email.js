const mongoose = require('mongoose');
async function fix() {
  await mongoose.connect('mongodb+srv://adminhero:Munna301vps@cluster0.cb0snl1.mongodb.net/admission-hero?retryWrites=true&w=majority&appName=Cluster0');
  const db = mongoose.connection.db;
  await db.collection('users').updateOne({email: 'alsoad488@gmail.com'}, {$set: {email: 'alsoadm488@gmail.com'}});
  console.log('Database updated successfully!');
  await mongoose.disconnect();
}
fix();
