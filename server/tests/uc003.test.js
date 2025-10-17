/**
 * UC-003: Complete Laboratory Testing - Simplified Test Suite
 * 
 * Focused tests that prove the use case works:
 * 1. Doctor orders lab test ✓
 * 2. Lab tech collects sample ✓
 * 3. Lab tech updates results ✓
 * 4. Patient views results ✓
 * 5. Error handling (auth & validation) ✓
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';
import LabOrder from '../src/models/LabOrder.js';

// Test data
let doctorToken, labTechToken, patientToken;
let doctorId, patientId;
let testOrderId;

describe('UC-003: Laboratory Testing Workflow', () => {
  
  // Setup: Create test users once
  beforeAll(async () => {
    // Clean database
    await User.deleteMany({});
    await LabOrder.deleteMany({});

    // Create users - using new + save to ensure pre-save hooks run
    const doctor = new User({
      name: 'Dr. Test',
      email: 'doctor@test.com',
      password: 'test123',
      role: 'Staff',
      specialization: 'Cardiology'
    });
    await doctor.save();
    doctorId = doctor._id;

    const labTech = new User({
      name: 'Lab Tech',
      email: 'lab@test.com',
      password: 'test123',
      role: 'Staff',
      specialization: 'Laboratory'
    });
    await labTech.save();

    const patient = new User({
      name: 'Patient Test',
      email: 'patient@test.com',
      password: 'test123',
      role: 'Patient'
    });
    await patient.save();
    patientId = patient._id;

    // Login to get tokens
    const doctorRes = await request(app).post('/api/auth/login').send({ email: 'doctor@test.com', password: 'test123' });
    doctorToken = doctorRes.body.data.token;

    const labRes = await request(app).post('/api/auth/login').send({ email: 'lab@test.com', password: 'test123' });
    labTechToken = labRes.body.data.token;

    const patientRes = await request(app).post('/api/auth/login').send({ email: 'patient@test.com', password: 'test123' });
    patientToken = patientRes.body.data.token;
  }, 30000);

  afterAll(async () => {
    await User.deleteMany({});
    await LabOrder.deleteMany({});
    await mongoose.connection.close();
  });

  // ===========================================
  // TEST 1: Doctor creates lab order
  // ===========================================
  test('1. Doctor creates lab order successfully', async () => {
    const response = await request(app)
      .post('/api/labs/order')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId: patientId.toString(),
        testType: 'Complete Blood Count',
        priority: 'Routine',
        clinicalNotes: 'Annual checkup'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.testType).toBe('Complete Blood Count');
    expect(response.body.data.status).toBe('Ordered');
    
    testOrderId = response.body.data._id;
  });

  // ===========================================
  // TEST 2: Lab tech collects sample
  // ===========================================
  test('2. Lab tech collects sample', async () => {
    const response = await request(app)
      .put(`/api/labs/collect-sample/${testOrderId}`)
      .set('Authorization', `Bearer ${labTechToken}`)
      .send({
        sampleType: 'Blood',
        collectionMethod: 'Venipuncture',
        sampleQuality: 'Good'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('Sample-Collected');
  });

  // ===========================================
  // TEST 3: Lab tech updates results
  // ===========================================
  test('3. Lab tech updates test results', async () => {
    const response = await request(app)
      .put(`/api/labs/results/${testOrderId}`)
      .set('Authorization', `Bearer ${labTechToken}`)
      .send({
        results: {
          WBC: { value: 7.5, unit: 'K/uL', normalRange: '4.5-11.0' },
          RBC: { value: 5.2, unit: 'M/uL', normalRange: '4.5-5.9' }
        },
        interpretation: 'Normal results',
        isCritical: false
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('Completed');
    expect(response.body.data.results.WBC.value).toBe(7.5);
  });

  // ===========================================
  // TEST 4: Patient views results
  // ===========================================
  test('4. Patient can view their lab results', async () => {
    const response = await request(app)
      .get(`/api/labs/patient/${patientId}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].testType).toBe('Complete Blood Count');
  });

  // ===========================================
  // TEST 5: Authorization - Patient cannot order labs
  // ===========================================
  test('5. Patient cannot create lab orders (authorization)', async () => {
    const response = await request(app)
      .post('/api/labs/order')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientId: patientId.toString(),
        testType: 'Blood Test'
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // ===========================================
  // TEST 6: Validation - Requires authentication
  // ===========================================
  test('6. Cannot create order without authentication', async () => {
    const response = await request(app)
      .post('/api/labs/order')
      .send({
        patientId: patientId.toString(),
        testType: 'Blood Test'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // ===========================================
  // TEST 7: Validation - Invalid data rejected
  // ===========================================
  test('7. Invalid patient ID is rejected', async () => {
    const response = await request(app)
      .post('/api/labs/order')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId: 'invalid-id',
        testType: 'Blood Test'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
