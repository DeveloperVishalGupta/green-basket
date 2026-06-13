import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

dotenv.config();

/**
 * Create Admin User Script
 * Run: node scripts/createAdmin.js
 */
async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@iqrafashion.com',
      password: 'admin123456',
      phone: '1234567890',
      role: 'admin',
      isVerified: true,
      isActive: true,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('❌ Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create(adminData);
    
    console.log('🎉 Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    ', admin.email);
    console.log('🔑 Password: ', 'admin123456');
    console.log('👤 Role:     ', admin.role);
    console.log('✓  Verified: ', admin.isVerified);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
createAdmin();
