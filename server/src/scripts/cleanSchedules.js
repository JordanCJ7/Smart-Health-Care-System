/**
 * Clean Doctor Schedules Script
 * 
 * This script deletes all doctor schedules from the database.
 * 
 * Usage: node src/scripts/cleanSchedules.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DoctorSchedule from '../models/DoctorSchedule.js';

dotenv.config();

async function cleanSchedules() {
  try {
    console.log('🧹 Cleaning Doctor Schedules\n');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete all schedules
    const result = await DoctorSchedule.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} doctor schedules\n`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed.');

  } catch (error) {
    console.error('\n❌ Error cleaning schedules:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
cleanSchedules();
