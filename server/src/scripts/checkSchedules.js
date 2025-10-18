import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DoctorSchedule from '../models/DoctorSchedule.js';
import User from '../models/User.js';

dotenv.config();

async function checkSchedules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const nullSchedules = await DoctorSchedule.find({ doctorId: null });
    console.log(`\nSchedules with null doctorId: ${nullSchedules.length}`);
    
    if (nullSchedules.length > 0) {
      console.log('\nNull schedules IDs:');
      nullSchedules.forEach(s => console.log(`  ${s._id}: date=${s.date}`));
    }

    const allSchedulesCount = await DoctorSchedule.countDocuments();
    console.log(`\nTotal schedules: ${allSchedulesCount}`);
    
    const sampleSchedules = await DoctorSchedule.find().limit(5).populate('doctorId', 'name specialization');
    console.log('\nSample schedules:');
    sampleSchedules.forEach(s => {
      console.log(`  ${s._id}: doctorId=${s.doctorId?._id || 'NULL'}, doctor=${s.doctorId?.name || 'NULL'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSchedules();
