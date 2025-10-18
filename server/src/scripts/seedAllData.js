/**
 * Master Seed Script - Seeds All Models
 * 
 * This script populates all models with realistic test data
 * related to the existing users in the database.
 * 
 * Usage: node src/scripts/seedAllData.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import DoctorSchedule from '../models/DoctorSchedule.js';
import Appointment from '../models/Appointment.js';
import LabOrder from '../models/LabOrder.js';
import EPrescription from '../models/EPrescription.js';
import Bed from '../models/Bed.js';
import TriageRecord from '../models/TriageRecord.js';

dotenv.config();

// Helper function to generate time slots
function generateTimeSlots() {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        time,
        status: 'Available'
      });
    }
  }
  return slots;
}

// Helper to get random element from array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper to get random elements from array
function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function seedAllData() {
  try {
    console.log('🌱 Master Seed Script - Populating All Models\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch existing users
    console.log('👥 Fetching existing users...');
    const doctors = await User.find({ role: 'Staff', specialization: { $exists: true, $ne: null } });
    const patients = await User.find({ role: 'Patient' });
    const nurse = await User.findOne({ email: 'nurse@hospital.local' });
    const pharmacist = await User.findOne({ email: 'pharmacist@hospital.local' });
    
    console.log(`   Found ${doctors.length} doctors`);
    console.log(`   Found ${patients.length} patients`);
    console.log(`   Found nurse: ${nurse ? '✓' : '✗'}`);
    console.log(`   Found pharmacist: ${pharmacist ? '✓' : '✗'}\n`);

    if (doctors.length === 0 || patients.length === 0) {
      console.error('❌ Error: No doctors or patients found. Run createTestUsers.js first!');
      process.exit(1);
    }

    // 1. SEED DOCTOR SCHEDULES
    console.log('📅 Seeding Doctor Schedules...');
    let schedulesCreated = 0;
    const schedulePromises = [];
    
    for (const doctor of doctors) {
      // Create schedules for the next 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(0, 0, 0, 0);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const existingSchedule = await DoctorSchedule.findOne({
          doctorId: doctor._id,
          date: date
        });

        if (!existingSchedule) {
          schedulePromises.push(
            DoctorSchedule.create({
              doctorId: doctor._id,
              date: date,
              location: 'Main Hospital',
              department: doctor.department || 'General',
              slots: generateTimeSlots(),
              isActive: true
            })
          );
          schedulesCreated++;
        }
      }
    }
    
    await Promise.all(schedulePromises);
    console.log(`   ✅ Created ${schedulesCreated} doctor schedules\n`);

    // 2. SEED APPOINTMENTS
    console.log('📋 Seeding Appointments...');
    let appointmentsCreated = 0;
    const appointmentPromises = [];
    
    for (const patient of patients) {
      // Create 2-3 appointments per patient
      const appointmentCount = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < appointmentCount; i++) {
        const doctor = getRandomElement(doctors);
        const daysAhead = Math.floor(Math.random() * 30) + 1;
        const appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + daysAhead);
        appointmentDate.setHours(0, 0, 0, 0);

        // Skip weekends
        if (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) continue;

        const schedule = await DoctorSchedule.findOne({
          doctorId: doctor._id,
          date: appointmentDate
        });

        if (schedule) {
          const availableSlot = schedule.slots.find(s => s.status === 'Available');
          
          if (availableSlot) {
            const statuses = ['Scheduled', 'Scheduled', 'Scheduled', 'Completed'];
            const status = i < appointmentCount - 1 ? 'Completed' : getRandomElement(statuses);
            
            appointmentPromises.push(
              Appointment.create({
                patientId: patient._id,
                doctorId: doctor._id,
                date: appointmentDate,
                time: availableSlot.time,
                status: status,
                department: doctor.department,
                reason: getRandomElement([
                  'Regular checkup',
                  'Follow-up consultation',
                  'Urgent care needed',
                  'Prescription renewal',
                  'Lab results review',
                  'Specialist consultation'
                ]),
                createdBy: patient._id
              })
            );
            appointmentsCreated++;

            // Mark slot as booked
            availableSlot.status = 'Booked';
            await schedule.save();
          }
        }
      }
    }
    
    await Promise.all(appointmentPromises);
    console.log(`   ✅ Created ${appointmentsCreated} appointments\n`);

    // 3. SEED LAB ORDERS
    console.log('🔬 Seeding Lab Orders...');
    let labOrdersCreated = 0;
    const labOrderPromises = [];
    
    const labTests = [
      'Complete Blood Count (CBC)',
      'Basic Metabolic Panel',
      'Lipid Panel',
      'Liver Function Test',
      'Thyroid Function Test',
      'Urinalysis',
      'HbA1c (Diabetes)',
      'Vitamin D Level',
      'COVID-19 PCR Test',
      'Chest X-Ray'
    ];

    for (const patient of patients) {
      // Create 1-3 lab orders per patient
      const labCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < labCount; i++) {
        const doctor = getRandomElement(doctors);
        const statuses = ['Ordered', 'Sample-Collected', 'Processing', 'Completed'];
        const status = getRandomElement(statuses);
        const priority = getRandomElement(['Routine', 'Routine', 'Routine', 'Urgent']);
        
        const labOrderData = {
          patientId: patient._id,
          doctorId: doctor._id,
          testType: getRandomElement(labTests),
          status: status,
          priority: priority,
          clinicalNotes: 'Routine screening as part of annual checkup'
        };

        if (status === 'Completed') {
          labOrderData.results = {
            summary: 'All values within normal range',
            details: {
              parameter1: 'Normal',
              parameter2: 'Normal',
              parameter3: 'Normal'
            },
            completedDate: new Date()
          };
        }

        labOrderPromises.push(LabOrder.create(labOrderData));
        labOrdersCreated++;
      }
    }
    
    await Promise.all(labOrderPromises);
    console.log(`   ✅ Created ${labOrdersCreated} lab orders\n`);

    // 4. SEED E-PRESCRIPTIONS
    console.log('💊 Seeding E-Prescriptions...');
    let prescriptionsCreated = 0;
    const prescriptionPromises = [];
    
    const medications = [
      { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime' },
      { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily before breakfast' },
      { name: 'Levothyroxine', dosage: '75mcg', frequency: 'Once daily in the morning' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed for pain' },
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' }
    ];

    for (const patient of patients) {
      // Create 1-2 prescriptions per patient
      const prescriptionCount = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < prescriptionCount; i++) {
        const doctor = getRandomElement(doctors);
        const medicationCount = Math.floor(Math.random() * 2) + 1;
        const selectedMeds = getRandomElements(medications, medicationCount).map(med => ({
          ...med,
          duration: getRandomElement(['7 days', '14 days', '30 days', '90 days']),
          instructions: 'Take with food'
        }));

        const statuses = ['Pending', 'Pending', 'Dispensed', 'Dispensed'];
        const status = getRandomElement(statuses);

        const prescriptionData = {
          patientId: patient._id,
          doctorId: doctor._id,
          medications: selectedMeds,
          status: status,
          refillsRemaining: Math.floor(Math.random() * 3),
          notes: 'Follow prescribed dosage strictly'
        };

        if (status === 'Dispensed' && pharmacist) {
          prescriptionData.validatedBy = pharmacist._id;
          prescriptionData.validatedAt = new Date();
        }

        prescriptionPromises.push(EPrescription.create(prescriptionData));
        prescriptionsCreated++;
      }
    }
    
    await Promise.all(prescriptionPromises);
    console.log(`   ✅ Created ${prescriptionsCreated} e-prescriptions\n`);

    // 5. SEED BEDS
    console.log('🛏️  Seeding Beds...');
    let bedsCreated = 0;
    
    const wards = ['General Ward', 'ICU', 'Emergency', 'Pediatric', 'Maternity', 'Surgery'];
    const bedsPerWard = 10;

    const existingBeds = await Bed.countDocuments();
    
    if (existingBeds === 0) {
      const bedPromises = [];
      
      for (const ward of wards) {
        for (let i = 1; i <= bedsPerWard; i++) {
          const bedNumber = `${ward.charAt(0)}${i.toString().padStart(3, '0')}`;
          
          // Randomly assign some beds to patients (20% occupancy)
          const isOccupied = Math.random() < 0.2;
          const bedData = {
            bedNumber: bedNumber,
            ward: ward,
            status: isOccupied ? 'Occupied' : 'Vacant'
          };

          if (isOccupied && patients.length > 0) {
            bedData.currentPatient = getRandomElement(patients)._id;
            bedData.assignedDate = new Date();
          }

          bedPromises.push(Bed.create(bedData));
          bedsCreated++;
        }
      }
      
      await Promise.all(bedPromises);
      console.log(`   ✅ Created ${bedsCreated} beds across ${wards.length} wards\n`);
    } else {
      console.log(`   ⏭️  Skipped: ${existingBeds} beds already exist\n`);
    }

    // 6. SEED TRIAGE RECORDS
    console.log('🏥 Seeding Triage Records...');
    let triageRecordsCreated = 0;
    const triagePromises = [];

    if (nurse) {
      // Create triage records for some patients
      const patientsForTriage = getRandomElements(patients, Math.min(5, patients.length));
      
      for (const patient of patientsForTriage) {
        const severityLevels = ['Normal', 'Stable', 'Urgent', 'Critical'];
        const severity = getRandomElement(severityLevels);
        
        const triageData = {
          patientId: patient._id,
          vitals: {
            bp: `${Math.floor(Math.random() * 40) + 110}/${Math.floor(Math.random() * 30) + 70}`,
            hr: Math.floor(Math.random() * 40) + 60,
            temp: (Math.random() * 2 + 97).toFixed(1),
            respiratoryRate: Math.floor(Math.random() * 10) + 12,
            oxygenSaturation: Math.floor(Math.random() * 5) + 95
          },
          symptoms: getRandomElement([
            'Chest pain and shortness of breath',
            'High fever and body aches',
            'Severe headache and dizziness',
            'Abdominal pain and nausea',
            'Minor injury requiring attention',
            'Routine checkup, no acute symptoms'
          ]),
          severityLevel: severity,
          admissionStatus: severity === 'Critical' ? 'Admitted-ER' : 
                          severity === 'Urgent' ? 'Admitted-Ward' : 'Queued',
          createdBy: nurse._id,
          notes: 'Patient stable, monitoring vitals'
        };

        // Assign bed if admitted
        if (triageData.admissionStatus !== 'Queued') {
          const availableBed = await Bed.findOne({ status: 'Vacant' });
          if (availableBed) {
            triageData.assignedBed = availableBed._id;
            availableBed.status = 'Occupied';
            availableBed.currentPatient = patient._id;
            availableBed.assignedDate = new Date();
            await availableBed.save();
          }
        }

        triagePromises.push(TriageRecord.create(triageData));
        triageRecordsCreated++;
      }
      
      await Promise.all(triagePromises);
      console.log(`   ✅ Created ${triageRecordsCreated} triage records\n`);
    } else {
      console.log('   ⏭️  Skipped: No nurse found in database\n');
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 SEEDING COMPLETE - SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`✅ Doctor Schedules:    ${schedulesCreated} created`);
    console.log(`✅ Appointments:        ${appointmentsCreated} created`);
    console.log(`✅ Lab Orders:          ${labOrdersCreated} created`);
    console.log(`✅ E-Prescriptions:     ${prescriptionsCreated} created`);
    console.log(`✅ Beds:                ${bedsCreated} created`);
    console.log(`✅ Triage Records:      ${triageRecordsCreated} created\n`);

    // Final database stats
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📈 TOTAL DATABASE RECORDS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const stats = {
      users: await User.countDocuments(),
      schedules: await DoctorSchedule.countDocuments(),
      appointments: await Appointment.countDocuments(),
      labOrders: await LabOrder.countDocuments(),
      prescriptions: await EPrescription.countDocuments(),
      beds: await Bed.countDocuments(),
      triageRecords: await TriageRecord.countDocuments()
    };

    console.log(`👥 Users:              ${stats.users}`);
    console.log(`📅 Doctor Schedules:   ${stats.schedules}`);
    console.log(`📋 Appointments:       ${stats.appointments}`);
    console.log(`🔬 Lab Orders:         ${stats.labOrders}`);
    console.log(`💊 E-Prescriptions:    ${stats.prescriptions}`);
    console.log(`🛏️  Beds:              ${stats.beds}`);
    console.log(`🏥 Triage Records:     ${stats.triageRecords}\n`);

    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('✅ All data seeded successfully!');
    console.log('🎉 Your Smart Health Care System is ready for testing!\n');

    // Close connection
    await mongoose.connection.close();
    console.log('📡 Database connection closed.\n');

  } catch (error) {
    console.error('\n❌ Error seeding data:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
seedAllData();
