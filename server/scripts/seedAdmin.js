/**
 * Usage: node scripts/seedAdmin.js
 * Creates an admin user if one does not exist (email from ADMIN_EMAIL env).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rentease';
  await mongoose.connect(uri);
  const email = process.env.ADMIN_EMAIL || 'admin@rentease.local';
  const password = process.env.ADMIN_PASSWORD || 'admin12345';
  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }
  await User.create({
    name: 'Platform Admin',
    email,
    password,
    role: 'admin',
    isVerified: true,
  });
  console.log('Admin created:', email, '/', password);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
