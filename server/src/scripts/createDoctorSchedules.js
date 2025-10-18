/**
 * Create Doctor Schedules Script
 * 
 * This script creates doctor schedules for staff members with specialization.
 * 
 * Usage: node src/scripts/createDoctorSchedules.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import DoctorSchedule from '../models/DoctorSchedule.js';

dotenv.config();

async function createDoctorSchedules() {
  try {
    console.log('📅 Doctor Schedules Creation Tool\n');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all staff members (doctors)
    const doctors = await User.find({ 
      role: 'Staff',
      specialization: { $exists: true, $ne: null }
    });

    console.log(`Found ${doctors.length} doctors with specialization\n`);

    if (doctors.length === 0) {
      console.log('⚠️  No doctors found. Please create test users first.');
      process.exit(1);
    }

    // Generate schedules for the next 30 days
    const schedules = [];
    const now = new Date();
    
    for (const doctor of doctors) {
      // Create 3 schedules per week for 4 weeks (12 schedules per doctor)
      for (let day = 1; day <= 28; day += 2) {
        const scheduleDate = new Date(now);
        scheduleDate.setDate(scheduleDate.getDate() + day);
        
        // Skip weekends
        if (scheduleDate.getDay() === 0 || scheduleDate.getDay() === 6) {
          continue;
        }

        const slots = [];
        // Generate time slots from 9 AM to 5 PM, 30-minute intervals
        for (let hour = 9; hour < 17; hour++) {
          for (let minute of [0, 30]) {
            const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            slots.push({
              time: timeStr,
              status: 'Available',
            });
          }
        }

        schedules.push({
          doctorId: doctor._id,
          date: scheduleDate,
          location: 'Main Hospital',
          department: doctor.department || 'General',
          slots: slots,
          isActive: true,
          notes: `Schedule for ${doctor.name} - ${doctor.specialization}`,
        });
      }
    }

    console.log(`📋 Creating ${schedules.length} schedules...\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const scheduleData of schedules) {
      // Check if schedule already exists
      const existingSchedule = await DoctorSchedule.findOne({
        doctorId: scheduleData.doctorId,
        date: scheduleData.date,
      });

      if (existingSchedule) {
        skippedCount++;
      } else {
        const schedule = new DoctorSchedule(scheduleData);
        await schedule.save();
        createdCount++;
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   Created: ${createdCount} schedules`);
    console.log(`   Skipped: ${skippedCount} schedules\n`);

    // Display summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 DOCTOR SCHEDULES SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');

    for (const doctor of doctors) {
      const doctorSchedules = await DoctorSchedule.countDocuments({
        doctorId: doctor._id,
      });
      console.log(`✅ ${doctor.name} (${doctor.specialization}): ${doctorSchedules} schedules`);
    }

    console.log('\n✨ Doctor schedules created successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating schedules:', error.message);
    process.exit(1);
  }
}

createDoctorSchedules();
