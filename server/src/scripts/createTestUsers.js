/**
 * Create Test Users Script
 * 
 * This script creates test users (Staff and Patient) for development/testing.
 * 
 * Usage: node src/scripts/createTestUsers.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function createTestUsers() {
  try {
    console.log('👥 Test Users Creation Tool\n');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const testUsers = [
      {
        name: 'Dr. John Smith',
        email: 'doctor@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0101',
        specialization: 'General Practice'
      },
      {
        name: 'Nurse Sarah Johnson',
        email: 'nurse@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0102',
        specialization: 'Emergency Care'
      },
      {
        name: 'Lab Technician Mike Davis',
        email: 'labtech@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0103',
        specialization: 'Laboratory'
      },
      {
        name: 'Pharmacist Emily Wilson',
        email: 'pharmacist@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0104',
        specialization: 'Pharmacy'
      },
      {
        name: 'John Doe',
        email: 'patient@hospital.local',
        password: 'Patient@12345',
        role: 'Patient',
        phone: '555-0201',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'Male',
        bloodType: 'O+'
      },
      {
        name: 'Jane Smith',
        email: 'patient2@hospital.local',
        password: 'Patient@12345',
        role: 'Patient',
        phone: '555-0202',
        dateOfBirth: new Date('1990-08-22'),
        gender: 'Female',
        bloodType: 'A+'
      }
    ];

    console.log(`📋 Creating ${testUsers.length} test users...\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`⏭️  Skipped: ${userData.email} (already exists)`);
        skippedCount++;
      } else {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created: ${userData.role} - ${userData.name} (${userData.email})`);
        createdCount++;
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   Created: ${createdCount} users`);
    console.log(`   Skipped: ${skippedCount} users\n`);

    // Display all test users
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📝 TEST USER CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('👨‍⚕️  STAFF USERS (All use password: Staff@12345)\n');
    console.log('Doctor:');
    console.log('   Email: doctor@hospital.local');
    console.log('   Access: All medical staff functions\n');

    console.log('Nurse:');
    console.log('   Email: nurse@hospital.local');
    console.log('   Access: All medical staff functions\n');

    console.log('Lab Technician:');
    console.log('   Email: labtech@hospital.local');
    console.log('   Access: All medical staff functions\n');

    console.log('Pharmacist:');
    console.log('   Email: pharmacist@hospital.local');
    console.log('   Access: All medical staff functions\n');

    console.log('👤 PATIENT USERS (All use password: Patient@12345)\n');
    console.log('Patient 1:');
    console.log('   Email: patient@hospital.local');
    console.log('   Name: John Doe\n');

    console.log('Patient 2:');
    console.log('   Email: patient2@hospital.local');
    console.log('   Name: Jane Smith\n');

    console.log('═══════════════════════════════════════════════════════════════\n');

    // Get total user count
    const totalUsers = await User.countDocuments();
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📈 Database User Summary:');
    console.log(`   Total users: ${totalUsers}`);
    console.log('   By role:');
    roleDistribution.forEach(({ _id, count }) => {
      console.log(`     - ${_id}: ${count} users`);
    });
    console.log();

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed.');

  } catch (error) {
    console.error('\n❌ Error creating test users:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
createTestUsers();
