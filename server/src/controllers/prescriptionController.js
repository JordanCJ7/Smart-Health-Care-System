import asyncHandler from 'express-async-handler';
import EPrescription from '../models/EPrescription.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';
import { sendSuccess } from '../utils/response.js';
import {
  notifyUnclearPrescription,
  notifyDrugUnavailable,
  notifyPartialDispense,
  notifyPrescriptionDispensed,
} from '../utils/notificationService.js';

// @desc    Create e-prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
export const createPrescription = asyncHandler(async (req, res) => {
  const { patientId, medications, refillsRemaining, notes } = req.body;

  // Verify patient exists
  const patient = await User.findById(patientId);
  if (!patient) {
    res.status(400);
    throw new Error('Patient not found');
  }

  const prescription = await EPrescription.create({
    patientId,
    doctorId: req.user.id,
    medications,
    refillsRemaining: refillsRemaining || 0,
    notes,
  });

  const populatedPrescription = await EPrescription.findById(prescription._id)
    .populate('patientId', 'name email phone dateOfBirth')
    .populate('doctorId', 'name specialization department');

  sendSuccess(res, populatedPrescription, 'Prescription created successfully', 201);
});

// @desc    Get pending prescriptions (for pharmacists)
// @route   GET /api/prescriptions/pending
// @access  Private (Pharmacist)
export const getPendingPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await EPrescription.find({ status: 'Pending' })
    .populate('patientId', 'name email phone dateOfBirth')
    .populate('doctorId', 'name specialization department')
    .sort('-createdAt');

  sendSuccess(res, prescriptions);
});

// @desc    Get all prescriptions (for staff/admin)
// @route   GET /api/prescriptions/all
// @access  Private (Staff, Admin)
export const getAllPrescriptions = asyncHandler(async (req, res) => {
  const { status, patientId, doctorId } = req.query;

  const query = {};
  if (status) query.status = status;
  if (patientId) query.patientId = patientId;
  if (doctorId) query.doctorId = doctorId;

  const prescriptions = await EPrescription.find(query)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .populate('validatedBy', 'name')
    .sort('-createdAt');

  sendSuccess(res, prescriptions);
});

// @desc    Search patients (staff only)
// @route   GET /api/prescriptions/search/patients
// @access  Private (Staff, Admin)
export const searchPatients = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;

  const query = { role: 'Patient' };
  
  if (search && search.length >= 2) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const patients = await User.find(query)
    .select('_id name email dateOfBirth bloodType gender phone')
    .limit(20)
    .lean();

  sendSuccess(res, {
    users: patients,
    count: patients.length
  });
});

// @desc    Get prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await EPrescription.findById(req.params.id)
    .populate('patientId', 'name email phone dateOfBirth')
    .populate('doctorId', 'name specialization department')
    .populate('validatedBy', 'name');

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  // Check authorization (Staff includes pharmacists and doctors)
  const isAuthorized =
    req.user.role === 'Staff' ||
    req.user.role === 'Admin' ||
    prescription.patientId._id.toString() === req.user.id ||
    prescription.doctorId._id.toString() === req.user.id;

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to view this prescription');
  }

  sendSuccess(res, prescription);
});

// @desc    Update prescription status (dispense/reject)
// @route   PUT /api/prescriptions/:id
// @access  Private (Pharmacist only)
export const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  let prescription = await EPrescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  if (prescription.status !== 'Pending') {
    res.status(400);
    throw new Error('Prescription has already been processed');
  }

  prescription.status = status;
  prescription.validatedBy = req.user.id;
  prescription.validatedAt = new Date();
  if (notes) prescription.notes = notes;

  await prescription.save();

  const updatedPrescription = await EPrescription.findById(prescription._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .populate('validatedBy', 'name');

  sendSuccess(res, updatedPrescription);
});

// @desc    Get patient's prescriptions
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private (Staff, Patient, Admin)
export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  // Check authorization (Staff includes doctors and pharmacists)
  const isAuthorized =
    req.user.role === 'Staff' ||
    req.user.role === 'Admin' ||
    req.user.id === patientId;

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to view these prescriptions');
  }

  const prescriptions = await EPrescription.find({ patientId })
    .populate('doctorId', 'name specialization')
    .populate('validatedBy', 'name')
    .sort('-createdAt');

  sendSuccess(res, prescriptions);
});

// @desc    Get doctor's prescriptions
// @route   GET /api/prescriptions/doctor/me
// @access  Private (Doctor only)
export const getDoctorPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await EPrescription.find({ doctorId: req.user.id })
    .populate('patientId', 'name email phone')
    .populate('validatedBy', 'name')
    .sort('-createdAt');

  sendSuccess(res, prescriptions);
});

// @desc    Check inventory availability for prescription (UC-001 Step 4)
// @route   POST /api/prescriptions/:id/check-inventory
// @access  Private (Pharmacist/Staff)
export const checkInventoryAvailability = asyncHandler(async (req, res) => {
  const prescription = await EPrescription.findById(req.params.id)
    .populate('medications');

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  const availabilityResults = [];
  let allAvailable = true;

  for (const med of prescription.medications) {
    const inventoryItem = await Inventory.findOne({ drugName: med.name });

    if (!inventoryItem) {
      availabilityResults.push({
        medication: med.name,
        available: false,
        reason: 'Not in inventory',
        alternatives: [],
      });
      allAvailable = false;
    } else {
      // Assuming 1 unit per prescription for simplicity
      const check = inventoryItem.checkAvailability(1);
      availabilityResults.push({
        medication: med.name,
        ...check,
      });
      if (!check.available) {
        allAvailable = false;
      }
    }
  }

  sendSuccess(res, {
    prescriptionId: prescription._id,
    allAvailable,
    medications: availabilityResults,
  });
});

// @desc    Request clarification from doctor (UC-001 Extension 3a)
// @route   POST /api/prescriptions/:id/clarify
// @access  Private (Pharmacist/Staff)
export const requestClarification = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    res.status(400);
    throw new Error('Clarification reason is required');
  }

  const prescription = await EPrescription.findById(req.params.id)
    .populate('doctorId', 'name email')
    .populate('patientId', 'name');

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  // Update prescription status
  prescription.status = 'Clarification_Required';
  prescription.clarificationRequest = {
    reason,
    requestedBy: req.user.id,
    requestedAt: new Date(),
    resolved: false,
  };

  await prescription.save();

  // Notify doctor
  await notifyUnclearPrescription(
    prescription._id,
    prescription.doctorId._id,
    req.user.id,
    reason
  );

  sendSuccess(res, prescription, 'Clarification request sent to doctor', 200);
});

// @desc    Suggest alternative medication (UC-001 Extension 4a)
// @route   POST /api/prescriptions/:id/suggest-alternative
// @access  Private (Pharmacist/Staff)
export const suggestAlternative = asyncHandler(async (req, res) => {
  const { medicationName, alternatives, reason } = req.body;

  if (!medicationName || !alternatives || !Array.isArray(alternatives)) {
    res.status(400);
    throw new Error('Medication name and alternatives array are required');
  }

  const prescription = await EPrescription.findById(req.params.id)
    .populate('doctorId', 'name email');

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  // Add to unavailable medications list
  prescription.unavailableMedications.push({
    medicationName,
    reason: reason || 'Out of stock',
    alternatives,
    suggestedBy: req.user.id,
  });

  await prescription.save();

  // Notify doctor about unavailable drug
  await notifyDrugUnavailable(
    prescription._id,
    prescription.doctorId._id,
    req.user.id,
    medicationName,
    alternatives.map(alt => ({ drugName: alt }))
  );

  sendSuccess(res, prescription, 'Alternative suggestions sent to doctor', 200);
});

// @desc    Dispense prescription with inventory check (UC-001 Steps 5-8)
// @route   POST /api/prescriptions/:id/dispense
// @access  Private (Pharmacist/Staff)
export const dispensePrescription = asyncHandler(async (req, res) => {
  const { paymentId } = req.body;

  const prescription = await EPrescription.findById(req.params.id)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name email');

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  if (prescription.status === 'Dispensed') {
    res.status(400);
    throw new Error('Prescription already dispensed');
  }

  // Check payment if required
  if (paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== 'Completed') {
      res.status(400);
      throw new Error('Valid completed payment is required');
    }
    prescription.paymentId = paymentId;
    prescription.paymentStatus = 'Completed';
  }

  // Check inventory and dispense
  const dispensedItems = [];
  const unavailableItems = [];

  for (const med of prescription.medications) {
    const inventoryItem = await Inventory.findOne({ drugName: med.name });

    if (!inventoryItem) {
      unavailableItems.push({
        name: med.name,
        reason: 'Not in inventory',
      });
      continue;
    }

    const check = inventoryItem.checkAvailability(1);
    if (!check.available) {
      unavailableItems.push({
        name: med.name,
        reason: check.reason,
        alternatives: check.alternatives,
      });
      continue;
    }

    // Dispense from inventory
    try {
      await inventoryItem.dispense(1);
      dispensedItems.push({
        medicationName: med.name,
        quantity: 1,
        dispensedAt: new Date(),
      });
    } catch (error) {
      unavailableItems.push({
        name: med.name,
        reason: error.message,
      });
    }
  }

  // Update prescription
  prescription.dispensedMedications = dispensedItems;

  if (unavailableItems.length === 0) {
    // All medications dispensed
    prescription.status = 'Dispensed';
    prescription.validatedBy = req.user.id;
    prescription.validatedAt = new Date();

    await prescription.save();

    // Notify patient
    await notifyPrescriptionDispensed(
      prescription._id,
      prescription.patientId._id,
      req.user.id
    );

    sendSuccess(res, prescription, 'Prescription fully dispensed', 200);
  } else {
    // Partial dispense (UC-001 Extension 7a)
    prescription.status = 'Partially_Dispensed';
    prescription.unavailableMedications = unavailableItems.map(item => ({
      medicationName: item.name,
      reason: item.reason,
      alternatives: item.alternatives || [],
      suggestedBy: req.user.id,
    }));

    await prescription.save();

    // Notify doctor for partial dispense
    await notifyPartialDispense(
      prescription._id,
      prescription.doctorId._id,
      req.user.id,
      dispensedItems,
      unavailableItems
    );

    sendSuccess(res, {
      prescription,
      dispensedItems,
      unavailableItems,
    }, 206, 'Prescription partially dispensed. Doctor notified for unavailable items.');
  }
});
