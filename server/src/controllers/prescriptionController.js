import asyncHandler from 'express-async-handler';
import EPrescription from '../models/EPrescription.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';

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

  sendSuccess(res, populatedPrescription, 201);
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

  // Check authorization
  const isAuthorized =
    req.user.role === 'Staff' ||
    req.user.role === 'Admin' ||
    req.user.role === 'Pharmacist' ||
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
// @access  Private (Doctor, Patient, Staff, Pharmacist)
export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  // Check authorization
  const isAuthorized =
    req.user.role === 'Doctor' ||
    req.user.role === 'Staff' ||
    req.user.role === 'Admin' ||
    req.user.role === 'Pharmacist' ||
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
