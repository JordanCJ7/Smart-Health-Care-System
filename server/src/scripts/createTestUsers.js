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
      // 8 Doctors with different specializations
      {
        name: 'System Administrator',
        email: 'admin@hospital.local',
        password: 'Admin@12345',
        role: 'Admin'
      },
      {
        name: 'Dr. John Smith',
        email: 'doctor@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0101',
        specialization: 'Cardiology',
        department: 'Cardiology Department',
        licenseNumber: 'MED-2025-001'
      },
      {
        name: 'Dr. Sarah Williams',
        email: 'doctor.williams@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0102',
        specialization: 'Pediatrics',
        department: 'Pediatrics Department',
        licenseNumber: 'MED-2025-002'
      },
      {
        name: 'Dr. Michael Chen',
        email: 'doctor.chen@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0103',
        specialization: 'Orthopedics',
        department: 'Orthopedics Department',
        licenseNumber: 'MED-2025-003'
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'doctor.rodriguez@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0104',
        specialization: 'Neurology',
        department: 'Neurology Department',
        licenseNumber: 'MED-2025-004'
      },
      {
        name: 'Dr. David Thompson',
        email: 'doctor.thompson@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0105',
        specialization: 'General Practice',
        department: 'General Medicine',
        licenseNumber: 'MED-2025-005'
      },
      {
        name: 'Dr. Lisa Anderson',
        email: 'doctor.anderson@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0106',
        specialization: 'Dermatology',
        department: 'Dermatology Department',
        licenseNumber: 'MED-2025-006'
      },
      {
        name: 'Dr. James Martinez',
        email: 'doctor.martinez@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0107',
        specialization: 'Ophthalmology',
        department: 'Ophthalmology Department',
        licenseNumber: 'MED-2025-007'
      },
      {
        name: 'Dr. Jennifer Lee',
        email: 'doctor.lee@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0108',
        specialization: 'Psychiatry',
        department: 'Psychiatry Department',
        licenseNumber: 'MED-2025-008'
      },
      // 3 Staff Members (Nurse, Lab Tech, Pharmacist)
      {
        name: 'Nurse Sarah Johnson',
        email: 'nurse@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0201',
      },
      {
        name: 'Lab Technician Mike Davis',
        email: 'labtech@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0202',
      },
      {
        name: 'Pharmacist Emily Wilson',
        email: 'pharmacist@hospital.local',
        password: 'Staff@12345',
        role: 'Staff',
        phone: '555-0203',
      },
      // Enhanced Patient Data
      {
        name: 'John Doe',
        email: 'patient@hospital.local',
        password: 'Patient@12345',
        role: 'Patient',
        phone: '555-0301',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'Male',
        bloodType: 'O+',
        address: '123 Main Street, Springfield, IL 62701',
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '555-0302'
        },
        insurance: {
          provider: 'Blue Cross Blue Shield',
          policyNumber: 'BCBS-123456',
          groupNumber: 'GRP-7890'
        }
      },
      {
        name: 'Jane Smith',
        email: 'patient2@hospital.local',
        password: 'Patient@12345',
        role: 'Patient',
        phone: '555-0303',
        dateOfBirth: new Date('1990-08-22'),
        gender: 'Female',
        bloodType: 'A+',
        address: '456 Oak Avenue, Chicago, IL 60601',
        emergencyContact: {
          name: 'Robert Smith',
          relationship: 'Father',
          phone: '555-0304'
        },
        insurance: {
          provider: 'Aetna',
          policyNumber: 'AET-789012',
          groupNumber: 'GRP-3456'
        }
      },
      {
        name: 'Robert Johnson',
        email: 'patient3@hospital.local',
        password: 'Patient@12345',
        role: 'Patient',
        phone: '555-0305',
        dateOfBirth: new Date('1978-03-10'),
        gender: 'Male',
        bloodType: 'B+',
        address: '789 Elm Street, Boston, MA 02101',
        emergencyContact: {
          name: 'Mary Johnson',
          relationship: 'Wife',
          phone: '555-0306'
        },
        insurance: {
          provider: 'UnitedHealthcare',
          policyNumber: 'UHC-345678',
          groupNumber: 'GRP-9012'
        }
      },
      {
        name: 'Maria Garcia',
        email: 'patient4@hospital.local',
        password: 'Patient@12345',
        role: 'Patient',
        phone: '555-0307',
        dateOfBirth: new Date('1995-11-30'),
        gender: 'Female',
        bloodType: 'AB+',
        address: '321 Pine Road, Los Angeles, CA 90001',
        emergencyContact: {
          name: 'Carlos Garcia',
          relationship: 'Brother',
          phone: '555-0308'
        },
        insurance: {
          provider: 'Cigna',
          policyNumber: 'CIG-901234',
          groupNumber: 'GRP-5678'
        }
      },
      {
        name: 'William Brown',
        email: 'patient5@hospital.local',
        password: 'Patient@12345',
        role: 'Patient',
        phone: '555-0309',
        dateOfBirth: new Date('1982-07-18'),
        gender: 'Male',
        bloodType: 'A-',
        address: '654 Maple Drive, Houston, TX 77001',
        emergencyContact: {
          name: 'Linda Brown',
          relationship: 'Mother',
          phone: '555-0310'
        },
        insurance: {
          provider: 'Humana',
          policyNumber: 'HUM-567890',
          groupNumber: 'GRP-1234'
        }
      },
      {
        name: 'Patricia Davis',
        email: 'patient6@hospital.local',
        password: 'Patient@12345',
        role: 'Patient',
        phone: '555-0311',
        dateOfBirth: new Date('1988-12-05'),
        gender: 'Female',
        bloodType: 'O-',
        address: '987 Cedar Lane, Phoenix, AZ 85001',
        emergencyContact: {
          name: 'Thomas Davis',
          relationship: 'Husband',
          phone: '555-0312'
        },
        insurance: {
          provider: 'Kaiser Permanente',
          policyNumber: 'KP-234567',
          groupNumber: 'GRP-8901'
        }
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

    console.log('👨‍⚕️  DOCTORS (All use password: Staff@12345)\n');
    console.log('1. Cardiology:');
    console.log('   Email: doctor@hospital.local (Dr. John Smith)\n');
    
    console.log('2. Pediatrics:');
    console.log('   Email: doctor.williams@hospital.local (Dr. Sarah Williams)\n');
    
    console.log('3. Orthopedics:');
    console.log('   Email: doctor.chen@hospital.local (Dr. Michael Chen)\n');
    
    console.log('4. Neurology:');
    console.log('   Email: doctor.rodriguez@hospital.local (Dr. Emily Rodriguez)\n');
    
    console.log('5. General Practice:');
    console.log('   Email: doctor.thompson@hospital.local (Dr. David Thompson)\n');
    
    console.log('6. Dermatology:');
    console.log('   Email: doctor.anderson@hospital.local (Dr. Lisa Anderson)\n');
    
    console.log('7. Ophthalmology:');
    console.log('   Email: doctor.martinez@hospital.local (Dr. James Martinez)\n');
    
    console.log('8. Psychiatry:');
    console.log('   Email: doctor.lee@hospital.local (Dr. Jennifer Lee)\n');

    console.log('👥 STAFF MEMBERS (All use password: Staff@12345)\n');
    console.log('Nurse:');
    console.log('   Email: nurse@hospital.local (Sarah Johnson)\n');

    console.log('Lab Technician:');
    console.log('   Email: labtech@hospital.local (Mike Davis)\n');

    console.log('Pharmacist:');
    console.log('   Email: pharmacist@hospital.local (Emily Wilson)\n');

    console.log('👤 PATIENTS (All use password: Patient@12345)\n');
    console.log('Patient 1:');
    console.log('   Email: patient@hospital.local');
    console.log('   Name: John Doe (Male, O+)\n');

    console.log('Patient 2:');
    console.log('   Email: patient2@hospital.local');
    console.log('   Name: Jane Smith (Female, A+)\n');

    console.log('Patient 3:');
    console.log('   Email: patient3@hospital.local');
    console.log('   Name: Robert Johnson (Male, B+)\n');

    console.log('Patient 4:');
    console.log('   Email: patient4@hospital.local');
    console.log('   Name: Maria Garcia (Female, AB+)\n');

    console.log('Patient 5:');
    console.log('   Email: patient5@hospital.local');
    console.log('   Name: William Brown (Male, A-)\n');

    console.log('Patient 6:');
    console.log('   Email: patient6@hospital.local');
    console.log('   Name: Patricia Davis (Female, O-)\n');

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
