/**
 * UC-004: Nurse Triage and Admission - Simplified Test Suite
 * 
 * Focused tests that prove the use case works:
 * 1. Nurse verifies patient identity ✓
 * 2. Nurse accesses patient medical history ✓
 * 3. Nurse creates triage record ✓
 * 4. Nurse checks bed availability ✓
 * 5. Nurse assigns bed to patient ✓
 * 6. System generates audit logs ✓
 * 7. Priority queue sorting works ✓
 * 8. Doctor receives notification ✓
 * 9. Error handling (auth, validation, extensions) ✓
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';
import TriageRecord from '../src/models/TriageRecord.js';
import Bed from '../src/models/Bed.js';
import AuditLog from '../src/models/AuditLog.js';
import Notification from '../src/models/Notification.js';

// Test data
let nurseToken, doctorToken, patientToken;
let nurseId, doctorId, patientId, bedId;
let testTriageId;

describe('UC-004: Nurse Triage and Admission Workflow', () => {
  
  // Setup: Create test users and bed once
  beforeAll(async () => {
    // Clean database
    await User.deleteMany({});
    await TriageRecord.deleteMany({});
    await Bed.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});

    // Create nurse
    const nurse = await User.create({
      name: 'Nurse Test',
      email: 'nurse@test.com',
      password: 'test123',
      role: 'Staff',
      department: 'Emergency',
      specialization: 'Triage',
    });
    nurseId = nurse._id;

    // Create doctor
    const doctor = await User.create({
      name: 'Dr. Test',
      email: 'doctor@test.com',
      password: 'test123',
      role: 'Staff',
      department: 'Emergency',
      specialization: 'Emergency Medicine',
    });
    doctorId = doctor._id;

    // Create patient with digital health card
    const patient = await User.create({
      name: 'Patient Test',
      email: 'patient@test.com',
      password: 'test123',
      role: 'Patient',
      digitalHealthCardId: 'DHC123456',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      bloodType: 'O+',
    });
    patientId = patient._id;

    // Create test bed
    const bed = await Bed.create({
      bedNumber: 'ER-101',
      ward: 'Emergency Room',
      status: 'Vacant',
    });
    bedId = bed._id;

    // Login users to get tokens
    const nurseRes = await request(app).post('/api/auth/login').send({ email: 'nurse@test.com', password: 'test123' });
    nurseToken = nurseRes.body.data.token;

    const doctorRes = await request(app).post('/api/auth/login').send({ email: 'doctor@test.com', password: 'test123' });
    doctorToken = doctorRes.body.data.token;

    const patientRes = await request(app).post('/api/auth/login').send({ email: 'patient@test.com', password: 'test123' });
    patientToken = patientRes.body.data.token;
  }, 30000);

  afterAll(async () => {
    await User.deleteMany({});
    await TriageRecord.deleteMany({});
    await Bed.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  // ===========================================
  // TEST 1: Verify Patient Identity (Step 2)
  // ===========================================
  test('1. Nurse verifies patient by digital health card', async () => {
    const response = await request(app)
      .post('/api/triage/verify-patient')
      .set('Authorization', `Bearer ${nurseToken}`)
      .send({ digitalHealthCardId: 'DHC123456' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.patient.name).toBe('Patient Test');
    expect(response.body.data.patient.digitalHealthCardId).toBe('DHC123456');
    expect(response.body.data.patient.bloodType).toBe('O+');
  });

  // ===========================================
  // TEST 2: Access Patient Medical History (Step 3)
  // ===========================================
  test('2. Nurse accesses patient medical history', async () => {
    const response = await request(app)
      .get(`/api/triage/patient-history/${patientId}`)
      .set('Authorization', `Bearer ${nurseToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.patient).toBeDefined();
    expect(response.body.data.medicalHistory).toBeDefined();
    expect(response.body.data.medicalHistory.appointments).toBeInstanceOf(Array);
    expect(response.body.data.medicalHistory.triageRecords).toBeInstanceOf(Array);
    expect(response.body.data.medicalHistory.labOrders).toBeInstanceOf(Array);
    expect(response.body.data.medicalHistory.prescriptions).toBeInstanceOf(Array);
  });

  // ===========================================
  // TEST 3: Record Triage Details (Step 4)
  // ===========================================
  test('3. Nurse creates triage record with vital signs', async () => {
    const response = await request(app)
      .post('/api/triage')
      .set('Authorization', `Bearer ${nurseToken}`)
      .send({
        patientId: patientId.toString(),
        vitals: {
          bp: '120/80',
          hr: 75,
          temp: 98.6,
          respiratoryRate: 16,
          oxygenSaturation: 98,
        },
        symptoms: 'Chest pain, shortness of breath',
        severityLevel: 'Urgent',
        notes: 'Patient appears in moderate distress',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.severityLevel).toBe('Urgent');
    expect(response.body.data.admissionStatus).toBe('Queued');
    expect(response.body.data.vitals.bp).toBe('120/80');
    expect(response.body.data.vitals.hr).toBe(75);
    
    testTriageId = response.body.data._id;
  });

  // ===========================================
  // TEST 4: Check Bed Availability (Step 5)
  // ===========================================
  test('4. Nurse checks bed availability', async () => {
    const response = await request(app)
      .get('/api/beds')
      .set('Authorization', `Bearer ${nurseToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    const vacantBeds = response.body.data.filter(b => b.status === 'Vacant');
    expect(vacantBeds.length).toBeGreaterThan(0);
  });

  // ===========================================
  // TEST 5: Assign Bed to Patient (Step 5 & 8)
  // ===========================================
  test('5. Nurse assigns bed and notifies doctor', async () => {
    const response = await request(app)
      .put('/api/beds/assign')
      .set('Authorization', `Bearer ${nurseToken}`)
      .send({
        bedId: bedId.toString(),
        patientId: patientId.toString(),
        triageRecordId: testTriageId,
        notifyDoctorId: doctorId.toString(),
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('Occupied');
    expect(response.body.data.currentPatient._id).toBe(patientId.toString());
  });

  // ===========================================
  // TEST 6: Audit Logs Generated (Step 6)
  // ===========================================
  test('6. System generates audit logs for triage actions', async () => {
    const auditLogs = await AuditLog.find({ userId: nurseId });
    
    expect(auditLogs.length).toBeGreaterThan(0);
    
    // Check for CREATE_TRIAGE audit log
    const triageLog = auditLogs.find(log => log.action === 'CREATE_TRIAGE');
    expect(triageLog).toBeDefined();
    expect(triageLog.resource).toBe('Triage');
    expect(triageLog.status).toBe('Success');
    expect(triageLog.userRole).toBe('Staff');
    
    // Check for ASSIGN_BED audit log
    const bedLog = auditLogs.find(log => log.action === 'ASSIGN_BED');
    expect(bedLog).toBeDefined();
    expect(bedLog.resource).toBe('Bed');
    expect(bedLog.status).toBe('Success');
  });

  // ===========================================
  // TEST 7: Priority Queue Sorting (Step 7)
  // ===========================================
  test('7. Triage records sorted by severity and arrival time', async () => {
    // Create multiple triage records with different severities
    await TriageRecord.create([
      {
        patientId,
        vitals: { bp: '110/70', hr: 80, temp: 98.0 },
        symptoms: 'Normal patient',
        severityLevel: 'Normal',
        createdBy: nurseId,
      },
      {
        patientId,
        vitals: { bp: '90/60', hr: 120, temp: 102 },
        symptoms: 'Critical patient',
        severityLevel: 'Critical',
        createdBy: nurseId,
      },
      {
        patientId,
        vitals: { bp: '115/75', hr: 85, temp: 99.5 },
        symptoms: 'Stable patient',
        severityLevel: 'Stable',
        createdBy: nurseId,
      },
    ]);

    const response = await request(app)
      .get('/api/triage')
      .set('Authorization', `Bearer ${nurseToken}`);

    expect(response.status).toBe(200);
    const records = response.body.data;
    
    // Critical should be first
    expect(records[0].severityLevel).toBe('Critical');
    
    // Check that higher severity comes before lower
    const criticalIndex = records.findIndex(r => r.severityLevel === 'Critical');
    const normalIndex = records.findIndex(r => r.severityLevel === 'Normal');
    expect(criticalIndex).toBeLessThan(normalIndex);
  });

  // ===========================================
  // TEST 8: Doctor Notification (Step 8)
  // ===========================================
  test('8. Doctor receives notification about patient admission', async () => {
    const notifications = await Notification.find({
      recipientId: doctorId,
      type: 'PATIENT_ADMITTED',
    });
    
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].title).toContain('Patient Admission');
    expect(notifications[0].priority).toBe('High');
    expect(notifications[0].status).toBe('Unread');
  });

  // ===========================================
  // TEST 9: Extension 2a - Patient Not Found
  // ===========================================
  test('9. Extension 2a: Handle missing patient details', async () => {
    const response = await request(app)
      .post('/api/triage/verify-patient')
      .set('Authorization', `Bearer ${nurseToken}`)
      .send({ digitalHealthCardId: 'INVALID999' });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('missing or incomplete');
  });

  // ===========================================
  // TEST 10: Extension 5a - No Beds Available
  // ===========================================
  test('10. Extension 5a: Handle occupied bed assignment', async () => {
    // Bed is already occupied from test 5
    const response = await request(app)
      .put('/api/beds/assign')
      .set('Authorization', `Bearer ${nurseToken}`)
      .send({
        bedId: bedId.toString(),
        patientId: patientId.toString(),
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('occupied');
  });

  // ===========================================
  // TEST 11: Authorization - Patient Cannot Create Triage
  // ===========================================
  test('11. Patient cannot create triage records (authorization)', async () => {
    const response = await request(app)
      .post('/api/triage')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientId: patientId.toString(),
        vitals: { bp: '120/80', hr: 75, temp: 98.6 },
        symptoms: 'Test',
        severityLevel: 'Stable',
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // ===========================================
  // TEST 12: Authentication Required
  // ===========================================
  test('12. Cannot access triage without authentication', async () => {
    const response = await request(app)
      .get('/api/triage');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // ===========================================
  // TEST 13: Validation - Missing Required Fields
  // ===========================================
  test('13. Invalid triage data is rejected', async () => {
    const response = await request(app)
      .post('/api/triage')
      .set('Authorization', `Bearer ${nurseToken}`)
      .send({
        patientId: patientId.toString(),
        // Missing vitals, symptoms, severityLevel
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // ===========================================
  // TEST 14: Complete Workflow Integration
  // ===========================================
  test('14. Complete triage to admission workflow', async () => {
    // Create new bed for this test
    const newBed = await Bed.create({
      bedNumber: 'ER-102',
      ward: 'Emergency Room',
      status: 'Vacant',
    });

    // Step 1: Already authenticated
    
    // Step 2: Verify patient
    const verifyRes = await request(app)
      .post('/api/triage/verify-patient')
      .set('Authorization', `Bearer ${nurseToken}`)
      .send({ patientId: patientId.toString() });
    expect(verifyRes.status).toBe(200);

    // Step 3: Access medical history
    const historyRes = await request(app)
      .get(`/api/triage/patient-history/${patientId}`)
      .set('Authorization', `Bearer ${nurseToken}`);
    expect(historyRes.status).toBe(200);

    // Step 4: Create triage record
    const triageRes = await request(app)
      .post('/api/triage')
      .set('Authorization', `Bearer ${nurseToken}`)
      .send({
        patientId: patientId.toString(),
        vitals: { bp: '130/85', hr: 88, temp: 99.5, respiratoryRate: 18, oxygenSaturation: 96 },
        symptoms: 'Fever, cough',
        severityLevel: 'Urgent',
      });
    expect(triageRes.status).toBe(201);

    // Step 5: Assign bed
    const assignRes = await request(app)
      .put('/api/beds/assign')
      .set('Authorization', `Bearer ${nurseToken}`)
      .send({
        bedId: newBed._id.toString(),
        patientId: patientId.toString(),
        triageRecordId: triageRes.body.data._id,
        notifyDoctorId: doctorId.toString(),
      });
    expect(assignRes.status).toBe(200);

    // Step 6: Verify audit logs created
    const logs = await AuditLog.find({ userId: nurseId });
    expect(logs.length).toBeGreaterThan(4); // Multiple actions logged

    // Step 8: Verify doctor notified
    const notes = await Notification.find({ recipientId: doctorId });
    expect(notes.length).toBeGreaterThan(0);
  });
});
