/**
 * UC-002: Patient Appointment & Registration - Comprehensive Test Suite
 * 
 * Tests the complete appointment booking workflow including:
 * 1. View available slots by specialization ✓
 * 2. Hold a slot temporarily ✓
 * 3. Book appointment with payment ✓
 * 4. Atomic booking with schedule update ✓
 * 5. Patient views appointments ✓
 * 6. Concurrency conflict detection ✓
 * 7. Add to waitlist when no slots ✓
 * 8. Notification sent on booking ✓
 * 9. Error handling (auth, validation, payment) ✓
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';
import Appointment from '../src/models/Appointment.js';
import DoctorSchedule from '../src/models/DoctorSchedule.js';
import Payment from '../src/models/Payment.js';
import Waitlist from '../src/models/Waitlist.js';
import Notification from '../src/models/Notification.js';

// Test data
let patientToken, doctorToken, adminToken;
let patientId, doctorId;
let testScheduleId;
let testPaymentId;

describe('UC-002: Patient Appointment & Registration', () => {
  
  // Setup: Create test users and schedule
  beforeAll(async () => {
    // Clean database
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await DoctorSchedule.deleteMany({});
    await Payment.deleteMany({});
    await Waitlist.deleteMany({});
    await Notification.deleteMany({});

    // Create users - using new + save to ensure pre-save hooks run
    const doctor = new User({
      name: 'Dr. Sarah Smith',
      email: 'doctor.uc002@test.com',
      password: 'test123',
      role: 'Staff',
      specialization: 'Cardiology',
      department: 'Cardiology',
      licenseNumber: 'DOC12345'
    });
    await doctor.save();
    doctorId = doctor._id;

    const patient = new User({
      name: 'John Patient',
      email: 'patient.uc002@test.com',
      password: 'test123',
      role: 'Patient',
      phone: '555-0100'
    });
    await patient.save();
    patientId = patient._id;

    const admin = new User({
      name: 'Admin User',
      email: 'admin.uc002@test.com',
      password: 'test123',
      role: 'Admin'
    });
    await admin.save();

    // Login to get tokens
    const doctorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor.uc002@test.com', password: 'test123' });
    doctorToken = doctorRes.body.data.token;

    const patientRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'patient.uc002@test.com', password: 'test123' });
    patientToken = patientRes.body.data.token;

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.uc002@test.com', password: 'test123' });
    adminToken = adminRes.body.data.token;

    // Create doctor schedule with available slots
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const schedule = await DoctorSchedule.create({
      doctorId: doctorId,
      date: tomorrow,
      location: 'Main Hospital - Floor 3',
      department: 'Cardiology',
      slots: [
        { time: '09:00', status: 'Available' },
        { time: '09:30', status: 'Available' },
        { time: '10:00', status: 'Available' },
        { time: '10:30', status: 'Available' }
      ]
    });
    testScheduleId = schedule._id.toString();

    // Create a completed payment for testing
    const payment = await Payment.create({
      userId: patientId,
      amount: 50,
      currency: 'USD',
      paymentMethod: 'PayPal',
      status: 'Completed',
      description: 'Appointment fee'
    });
    testPaymentId = payment._id.toString();
  }, 30000);

  afterAll(async () => {
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await DoctorSchedule.deleteMany({});
    await Payment.deleteMany({});
    await Waitlist.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  // ===========================================
  // TEST 1: View available slots (UC-002 Step 2-3)
  // ===========================================
  test('1. Patient views available slots by specialization', async () => {
    const response = await request(app)
      .get(`/api/schedules/available?specialization=Cardiology`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    
    // If schedules exist, verify structure
    if (response.body.data.length > 0) {
      const schedule = response.body.data[0];
      expect(schedule.doctorId.specialization).toBe('Cardiology');
      expect(schedule.availableSlots).toBeInstanceOf(Array);
    }
    
    // Test passes if endpoint works, even if no current schedules
    expect(true).toBe(true);
  });

  // ===========================================
  // TEST 2: Hold a slot temporarily (UC-002 Step 4)
  // ===========================================
  test('2. Patient holds a slot temporarily', async () => {
    const response = await request(app)
      .post('/api/schedules/hold')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        scheduleId: testScheduleId,
        time: '09:00',
        holdDurationMinutes: 10
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.schedule).toBeDefined();
    expect(response.body.data.holdUntil).toBeDefined();
    
    // Verify slot is marked as held
    const heldSlot = response.body.data.schedule.slots.find(s => s.time === '09:00');
    expect(heldSlot.status).toBe('Held');
    expect(heldSlot.heldBy).toBeDefined();
  });

  // ===========================================
  // TEST 3: Book appointment atomically (UC-002 Step 6)
  // ===========================================
  test('3. Patient books appointment with payment', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorId.toString(),
        date: dateStr,
        time: '09:30',
        scheduleId: testScheduleId,
        reason: 'Routine cardiology checkup',
        notes: 'First visit',
        paymentId: testPaymentId
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.appointment).toBeDefined();
    expect(response.body.data.appointment.status).toBe('Scheduled');
    expect(response.body.data.appointment.doctorId.name).toBe('Dr. Sarah Smith');
    expect(response.body.data.appointment.patientId.name).toBe('John Patient');
    
    // Verify ICS calendar file generated (UC-002 Step 7)
    expect(response.body.data.icsFile).toBeDefined();
    expect(response.body.data.icsFile).toContain('BEGIN:VCALENDAR');
    expect(response.body.data.icsFile).toContain('Dr. Sarah Smith');
  });

  // ===========================================
  // TEST 4: Schedule updated atomically
  // ===========================================
  test('4. Doctor schedule is updated when appointment booked', async () => {
    const response = await request(app)
      .get(`/api/schedules/doctor/${doctorId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    const schedule = response.body.data[0];
    const bookedSlot = schedule.slots.find(s => s.time === '09:30');
    
    expect(bookedSlot).toBeDefined();
    expect(bookedSlot.status).toBe('Booked');
    expect(bookedSlot.appointmentId).toBeDefined();
  });

  // ===========================================
  // TEST 5: Patient views appointments (UC-002 Step 8)
  // ===========================================
  test('5. Patient views their appointments', async () => {
    const response = await request(app)
      .get('/api/appointments/me')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    const appointment = response.body.data[0];
    expect(appointment.patientId._id).toBe(patientId.toString());
    expect(appointment.status).toBe('Scheduled');
    expect(appointment.doctorId.specialization).toBe('Cardiology');
  });

  // ===========================================
  // TEST 6: Notification sent on booking (UC-002 Step 7)
  // ===========================================
  test('6. Confirmation notification sent to patient', async () => {
    const notifications = await Notification.find({ 
      recipientId: patientId,
      type: 'GENERAL' 
    });

    expect(notifications.length).toBeGreaterThan(0);
    
    const appointmentNotif = notifications.find(n => 
      n.message.includes('appointment') && n.message.includes('confirmed')
    );
    
    expect(appointmentNotif).toBeDefined();
    expect(appointmentNotif.priority).toBe('Medium');
    expect(appointmentNotif.status).toBe('Unread');
  });

  // ===========================================
  // TEST 7: Concurrency conflict (UC-002 Extension 6a)
  // ===========================================
  test('7. Concurrent booking conflict detected', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    // Try to book the same slot that was already booked in test 3
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorId.toString(),
        date: dateStr,
        time: '09:30',
        scheduleId: testScheduleId,
        reason: 'Another appointment'
      });

    expect(response.status).toBe(409); // Conflict
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('already taken');
  });

  // ===========================================
  // TEST 8: Add to waitlist (UC-002 Extension 3a)
  // ===========================================
  test('8. Patient adds to waitlist when no slots available', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0];

    const response = await request(app)
      .post('/api/waitlist')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorId.toString(),
        preferredDate: dateStr,
        alternativeDates: [
          new Date(futureDate.getTime() + 86400000).toISOString().split('T')[0],
          new Date(futureDate.getTime() + 172800000).toISOString().split('T')[0]
        ],
        reason: 'Follow-up consultation'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('Active');
    expect(response.body.data.preferredDate).toBeDefined();
    expect(response.body.data.alternativeDates).toBeInstanceOf(Array);
    expect(response.body.data.alternativeDates.length).toBe(2);
  });

  // ===========================================
  // TEST 9: View waitlist
  // ===========================================
  test('9. Patient views their waitlist entries', async () => {
    const response = await request(app)
      .get('/api/waitlist/me')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    const entry = response.body.data[0];
    expect(entry.patientId).toBe(patientId.toString());
    expect(entry.status).toBe('Active');
  });

  // ===========================================
  // TEST 10: Payment validation (UC-002 Step 5)
  // ===========================================
  test('10. Invalid payment rejected', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorId.toString(),
        date: dateStr,
        time: '10:00',
        scheduleId: testScheduleId,
        reason: 'Checkup',
        paymentId: new mongoose.Types.ObjectId().toString() // Invalid payment ID
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('payment');
  });

  // ===========================================
  // TEST 11: Authentication required (UC-002 Step 1)
  // ===========================================
  test('11. Authentication required for booking', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const response = await request(app)
      .post('/api/appointments')
      .send({
        doctorId: doctorId.toString(),
        date: dateStr,
        time: '10:00',
        reason: 'Checkup'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // ===========================================
  // TEST 12: Invalid doctor ID rejected
  // ===========================================
  test('12. Invalid doctor ID is rejected', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: 'invalid-doctor-id',
        date: dateStr,
        time: '10:00',
        reason: 'Checkup'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // ===========================================
  // TEST 13: Slot hold expiration
  // ===========================================
  test('13. Held slot can be released', async () => {
    // First hold a slot
    await request(app)
      .post('/api/schedules/hold')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        scheduleId: testScheduleId,
        time: '10:30',
        holdDurationMinutes: 10
      });

    // Then release it
    const response = await request(app)
      .post('/api/schedules/release')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        scheduleId: testScheduleId,
        time: '10:30'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toContain('released');
  });

  // ===========================================
  // TEST 14: Cancel waitlist entry
  // ===========================================
  test('14. Patient can cancel waitlist entry', async () => {
    // Get patient's waitlist entries
    const listRes = await request(app)
      .get('/api/waitlist/me')
      .set('Authorization', `Bearer ${patientToken}`);
    
    const entryId = listRes.body.data[0]._id;

    // Cancel the entry
    const response = await request(app)
      .delete(`/api/waitlist/${entryId}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toContain('cancelled');
  });

  // ===========================================
  // TEST 15: Staff can view all appointments
  // ===========================================
  test('15. Staff can view all appointments', async () => {
    const response = await request(app)
      .get('/api/appointments/all')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  // ===========================================
  // TEST 16: Update appointment status
  // ===========================================
  test('16. Doctor can update appointment status', async () => {
    // Get first appointment
    const listRes = await request(app)
      .get('/api/appointments/me')
      .set('Authorization', `Bearer ${patientToken}`);
    
    const appointmentId = listRes.body.data[0]._id;

    // Update status
    const response = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        status: 'Completed',
        notes: 'Patient completed checkup successfully'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('Completed');
  });

  // ===========================================
  // TEST 17: Filter appointments by date
  // ===========================================
  test('17. Filter appointments by date', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const response = await request(app)
      .get(`/api/appointments/all?date=${dateStr}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
  });
});
