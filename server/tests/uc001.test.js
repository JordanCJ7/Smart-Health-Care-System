/**
 * UC-001: E-Prescription & Pharmacy Dispense - Test Suite
 * 
 * Focused tests that prove the use case works:
 * 1. Doctor creates e-prescription ✓
 * 2. Pharmacist views pending prescriptions ✓
 * 3. Pharmacist checks inventory availability (Step 4) ✓
 * 4. Pharmacist dispenses prescription (Steps 5-8) ✓
 * 5. Extension 3a: Request clarification for unclear prescription ✓
 * 6. Extension 4a: Suggest alternative for unavailable drug ✓
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';
import EPrescription from '../src/models/EPrescription.js';
import Inventory from '../src/models/Inventory.js';
import Notification from '../src/models/Notification.js';
import Payment from '../src/models/Payment.js';

// Test data
let doctorToken, pharmacistToken, patientToken;
let doctorId, patientId, pharmacistId;
let testPrescriptionId;

describe('UC-001: E-Prescription & Pharmacy Dispense Workflow', () => {
  
  // Setup: Create test users and inventory once
  beforeAll(async () => {
    // Clean database
    await User.deleteMany({});
    await EPrescription.deleteMany({});
    await Inventory.deleteMany({});
    await Notification.deleteMany({});
    await Payment.deleteMany({});

    // Create users - using new + save to ensure pre-save hooks run
    const doctor = new User({
      name: 'Dr. Smith',
      email: 'doctor@pharmacy.test',
      password: 'test123',
      role: 'Staff',
      specialization: 'General Practice'
    });
    await doctor.save();
    doctorId = doctor._id;

    const pharmacist = new User({
      name: 'Pharmacist Jane',
      email: 'pharmacist@test.com',
      password: 'test123',
      role: 'Staff',
      specialization: 'Pharmacy'
    });
    await pharmacist.save();
    pharmacistId = pharmacist._id;

    const patient = new User({
      name: 'Patient John',
      email: 'patient@pharmacy.test',
      password: 'test123',
      role: 'Patient'
    });
    await patient.save();
    patientId = patient._id;

    // Create inventory items
    await Inventory.create({
      drugName: 'Amoxicillin',
      genericName: 'Amoxicillin',
      category: 'Antibiotic',
      quantity: 50,
      unit: 'tablets',
      reorderLevel: 10,
      expiryDate: new Date('2026-12-31'),
      batchNumber: 'BATCH001',
      alternatives: [
        { drugName: 'Azithromycin', genericName: 'Azithromycin' }
      ]
    });

    await Inventory.create({
      drugName: 'Ibuprofen',
      genericName: 'Ibuprofen',
      category: 'Pain Relief',
      quantity: 0, // Out of stock for testing
      unit: 'tablets',
      reorderLevel: 20,
      expiryDate: new Date('2026-06-30'),
      batchNumber: 'BATCH002',
      alternatives: [
        { drugName: 'Acetaminophen', genericName: 'Paracetamol' }
      ]
    });

    // Login to get tokens
    const doctorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor@pharmacy.test', password: 'test123' });
    doctorToken = doctorRes.body.data.token;

    const pharmacistRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pharmacist@test.com', password: 'test123' });
    pharmacistToken = pharmacistRes.body.data.token;

    const patientRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'patient@pharmacy.test', password: 'test123' });
    patientToken = patientRes.body.data.token;
  }, 30000);

  afterAll(async () => {
    await User.deleteMany({});
    await EPrescription.deleteMany({});
    await Inventory.deleteMany({});
    await Notification.deleteMany({});
    await Payment.deleteMany({});
    await mongoose.connection.close();
  });

  // ===========================================
  // TEST 1: Doctor creates e-prescription (Step 1)
  // ===========================================
  test('1. Doctor creates e-prescription successfully', async () => {
    const response = await request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId: patientId.toString(),
        medications: [
          {
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Three times daily',
            duration: '7 days',
            instructions: 'Take with food'
          }
        ],
        refillsRemaining: 0,
        notes: 'For bacterial infection'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.medications).toHaveLength(1);
    expect(response.body.data.medications[0].name).toBe('Amoxicillin');
    expect(response.body.data.status).toBe('Pending');
    
    testPrescriptionId = response.body.data._id;
  });

  // ===========================================
  // TEST 2: Pharmacist views pending prescriptions (Step 2)
  // ===========================================
  test('2. Pharmacist can view pending prescriptions', async () => {
    const response = await request(app)
      .get('/api/prescriptions/pending')
      .set('Authorization', `Bearer ${pharmacistToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    const prescription = response.body.data.find(p => p._id === testPrescriptionId);
    expect(prescription).toBeDefined();
    expect(prescription.medications[0].name).toBe('Amoxicillin');
  });

  // ===========================================
  // TEST 3: Pharmacist checks inventory (Step 4 - <<include>> Confirm Availability)
  // ===========================================
  test('3. Pharmacist checks inventory availability', async () => {
    const response = await request(app)
      .post(`/api/prescriptions/${testPrescriptionId}/check-inventory`)
      .set('Authorization', `Bearer ${pharmacistToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.prescriptionId).toBe(testPrescriptionId);
    expect(response.body.data.medications).toBeInstanceOf(Array);
    
    const amoxCheck = response.body.data.medications.find(m => m.medication === 'Amoxicillin');
    expect(amoxCheck).toBeDefined();
    expect(amoxCheck.available).toBe(true);
  });

  // ===========================================
  // TEST 4: Pharmacist dispenses prescription (Steps 5-8)
  // ===========================================
  test('4. Pharmacist dispenses prescription successfully', async () => {
    const response = await request(app)
      .post(`/api/prescriptions/${testPrescriptionId}/dispense`)
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('Dispensed');
    expect(response.body.data.validatedBy).toBe(pharmacistId.toString());
    expect(response.body.data.dispensedMedications).toBeInstanceOf(Array);
    expect(response.body.data.dispensedMedications.length).toBeGreaterThan(0);
  });

  // ===========================================
  // TEST 5: Extension 3a - Request clarification for unclear prescription
  // ===========================================
  test('5. Pharmacist requests clarification for unclear prescription', async () => {
    // Create another prescription
    const prescriptionRes = await request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId: patientId.toString(),
        medications: [
          {
            name: 'Unclear Drug',
            dosage: 'Unknown',
            frequency: 'As needed',
            duration: 'Unknown'
          }
        ]
      });

    const unclearPrescriptionId = prescriptionRes.body.data._id;

    const response = await request(app)
      .post(`/api/prescriptions/${unclearPrescriptionId}/clarify`)
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({
        reason: 'Dosage and frequency are unclear. Please provide specific instructions.'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('Clarification_Required');
    expect(response.body.data.clarificationRequest).toBeDefined();
    expect(response.body.data.clarificationRequest.reason).toContain('unclear');

    // Verify notification was created for doctor
    const notifications = await Notification.find({ 
      recipientId: doctorId,
      type: 'PRESCRIPTION_UNCLEAR'
    });
    expect(notifications.length).toBeGreaterThan(0);
  });

  // ===========================================
  // TEST 6: Extension 4a - Suggest alternative for unavailable drug
  // ===========================================
  test('6. Pharmacist suggests alternative for unavailable drug', async () => {
    // Create prescription with out-of-stock drug
    const prescriptionRes = await request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId: patientId.toString(),
        medications: [
          {
            name: 'Ibuprofen',
            dosage: '400mg',
            frequency: 'Three times daily',
            duration: '5 days'
          }
        ]
      });

    const outOfStockPrescriptionId = prescriptionRes.body.data._id;

    const response = await request(app)
      .post(`/api/prescriptions/${outOfStockPrescriptionId}/suggest-alternative`)
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({
        medicationName: 'Ibuprofen',
        alternatives: ['Acetaminophen', 'Naproxen'],
        reason: 'Ibuprofen is currently out of stock'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.unavailableMedications).toBeInstanceOf(Array);
    expect(response.body.data.unavailableMedications.length).toBeGreaterThan(0);
    
    const unavailable = response.body.data.unavailableMedications[0];
    expect(unavailable.medicationName).toBe('Ibuprofen');
    expect(unavailable.alternatives).toContain('Acetaminophen');

    // Verify notification was sent to doctor
    const notifications = await Notification.find({ 
      recipientId: doctorId,
      type: 'DRUG_UNAVAILABLE'
    });
    expect(notifications.length).toBeGreaterThan(0);
  });

  // ===========================================
  // EDGE CASE TEST: Authorization - Patient cannot dispense prescriptions
  // ===========================================
  test('7. Patient cannot dispense prescriptions (authorization)', async () => {
    const response = await request(app)
      .post(`/api/prescriptions/${testPrescriptionId}/dispense`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({});

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // ===========================================
  // ERROR CASE TEST: Cannot dispense already dispensed prescription
  // ===========================================
  test('8. Cannot dispense already dispensed prescription', async () => {
    const response = await request(app)
      .post(`/api/prescriptions/${testPrescriptionId}/dispense`)
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error || response.body.message).toContain('already dispensed');
  });
});
