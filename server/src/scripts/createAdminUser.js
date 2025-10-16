/**
 * Create Admin User Script
 * 
 * This script creates an admin user in the database.
 * If the admin user already exists, it will update their password.
 * 
 * Usage: node src/scripts/createAdminUser.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function createAdminUser() {
  try {
    console.log('🔐 Admin User Creation Tool\n');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Admin user details
    const adminData = {
      name: 'System Administrator',
      email: 'admin@hospital.local',
      password: 'Admin@12345',
      role: 'Admin'
    };

    console.log('📋 Creating admin user with the following details:');
    console.log(`   Name: ${adminData.name}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Role: ${adminData.role}\n`);

    // Check if admin already exists
    console.log('Checking if admin user already exists...');
    let admin = await User.findOne({ email: adminData.email });

    if (admin) {
      console.log('⚠️  Admin user already exists. Updating password...\n');
      
      // Update password
      admin.password = adminData.password;
      await admin.save();
      
      console.log('✅ Admin user password updated successfully!\n');
    } else {
      console.log('Creating new admin user...\n');
      
      // Create new admin user
      admin = new User(adminData);
      await admin.save();
      
      console.log('✅ Admin user created successfully!\n');
    }

    // Display admin credentials
    console.log('═══════════════════════════════════════════════════');
    console.log('🔓 ADMIN CREDENTIALS (Save these securely)');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📧 Email:    ${adminData.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log(`👤 Name:     ${adminData.name}`);
    console.log(`⚙️  Role:     ${adminData.role}`);
    console.log('═══════════════════════════════════════════════════\n');

    // Verify the user was created/updated
    const verifiedAdmin = await User.findOne({ email: adminData.email }).select('-password');
    console.log('✅ Verification - Admin user in database:');
    console.log(`   ID: ${verifiedAdmin._id}`);
    console.log(`   Email: ${verifiedAdmin.email}`);
    console.log(`   Role: ${verifiedAdmin.role}`);
    console.log(`   Created: ${verifiedAdmin.createdAt}`);
    console.log(`   Updated: ${verifiedAdmin.updatedAt}\n`);

    // Show login instructions
    console.log('📝 NEXT STEPS:');
    console.log('1. Go to the login page');
    console.log(`2. Enter email: ${adminData.email}`);
    console.log(`3. Enter password: ${adminData.password}`);
    console.log('4. Click "Sign In"');
    console.log('5. You will be redirected to the Admin Dashboard\n');

    console.log('⚠️  SECURITY RECOMMENDATION:');
    console.log('   Change the admin password after first login!\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed.');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
createAdminUser();
