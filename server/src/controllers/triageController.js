import asyncHandler from 'express-async-handler';
import TriageRecord from '../models/TriageRecord.js';
import Bed from '../models/Bed.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Create triage record
// @route   POST /api/triage
// @access  Private (Nurse only)
export const createTriageRecord = asyncHandler(async (req, res) => {
  const { patientId, vitals, symptoms, severityLevel, notes } = req.body;

  // Verify patient exists
  const patient = await User.findById(patientId);
  if (!patient) {
    res.status(400);
    throw new Error('Patient not found');
  }

  const triageRecord = await TriageRecord.create({
    patientId,
    vitals,
    symptoms,
    severityLevel,
    notes,
    createdBy: req.user.id,
  });

  const populatedRecord = await TriageRecord.findById(triageRecord._id)
    .populate('patientId', 'name email phone dateOfBirth gender bloodType')
    .populate('createdBy', 'name');

  sendSuccess(res, populatedRecord, 201);
});

// @desc    Get all triage records
// @route   GET /api/triage
// @access  Private (Staff, Nurse, Doctor)
export const getTriageRecords = asyncHandler(async (req, res) => {
  const { status, severityLevel, patientId } = req.query;

  const query = {};
  if (status) query.admissionStatus = status;
  if (severityLevel) query.severityLevel = severityLevel;
  if (patientId) query.patientId = patientId;

  const records = await TriageRecord.find(query)
    .populate('patientId', 'name email phone dateOfBirth gender bloodType')
    .populate('assignedBed', 'bedNumber ward')
    .populate('createdBy', 'name')
    .sort('-createdAt');

  sendSuccess(res, records);
});

// @desc    Get triage record by ID
// @route   GET /api/triage/:id
// @access  Private
export const getTriageRecordById = asyncHandler(async (req, res) => {
  const record = await TriageRecord.findById(req.params.id)
    .populate('patientId', 'name email phone dateOfBirth gender bloodType')
    .populate('assignedBed', 'bedNumber ward status')
    .populate('createdBy', 'name');

  if (!record) {
    res.status(404);
    throw new Error('Triage record not found');
  }

  sendSuccess(res, record);
});

// @desc    Update triage record
// @route   PUT /api/triage/:id
// @access  Private (Nurse, Staff)
export const updateTriageRecord = asyncHandler(async (req, res) => {
  let record = await TriageRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error('Triage record not found');
  }

  const { vitals, symptoms, severityLevel, admissionStatus, assignedBed, notes } = req.body;

  if (vitals) record.vitals = { ...record.vitals, ...vitals };
  if (symptoms) record.symptoms = symptoms;
  if (severityLevel) record.severityLevel = severityLevel;
  if (admissionStatus) record.admissionStatus = admissionStatus;
  if (assignedBed) record.assignedBed = assignedBed;
  if (notes !== undefined) record.notes = notes;

  await record.save();

  const updatedRecord = await TriageRecord.findById(record._id)
    .populate('patientId', 'name email phone')
    .populate('assignedBed', 'bedNumber ward')
    .populate('createdBy', 'name');

  sendSuccess(res, updatedRecord);
});

// @desc    Get all beds
// @route   GET /api/beds
// @access  Private (Staff, Nurse)
export const getAllBeds = asyncHandler(async (req, res) => {
  const { status, ward } = req.query;

  const query = {};
  if (status) query.status = status;
  if (ward) query.ward = ward;

  const beds = await Bed.find(query)
    .populate('currentPatient', 'name email phone')
    .sort('ward bedNumber');

  sendSuccess(res, beds);
});

// @desc    Get bed by ID
// @route   GET /api/beds/:id
// @access  Private
export const getBedById = asyncHandler(async (req, res) => {
  const bed = await Bed.findById(req.params.id)
    .populate('currentPatient', 'name email phone dateOfBirth gender');

  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }

  sendSuccess(res, bed);
});

// @desc    Create bed
// @route   POST /api/beds
// @access  Private (Admin, Staff)
export const createBed = asyncHandler(async (req, res) => {
  const { bedNumber, ward, notes } = req.body;

  // Check if bed number already exists
  const existingBed = await Bed.findOne({ bedNumber });
  if (existingBed) {
    res.status(400);
    throw new Error('Bed number already exists');
  }

  const bed = await Bed.create({
    bedNumber,
    ward,
    notes,
  });

  sendSuccess(res, bed, 201);
});

// @desc    Assign bed to patient
// @route   PUT /api/beds/assign
// @access  Private (Nurse, Staff)
export const assignBed = asyncHandler(async (req, res) => {
  const { bedId, patientId } = req.body;

  // Check if bed exists and is available
  const bed = await Bed.findById(bedId);
  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }

  if (bed.status === 'Occupied') {
    res.status(400);
    throw new Error('Bed is already occupied');
  }

  // Verify patient exists
  const patient = await User.findById(patientId);
  if (!patient) {
    res.status(400);
    throw new Error('Patient not found');
  }

  // Update bed
  bed.status = 'Occupied';
  bed.currentPatient = patientId;
  bed.assignedDate = new Date();
  await bed.save();

  const updatedBed = await Bed.findById(bedId)
    .populate('currentPatient', 'name email phone');

  sendSuccess(res, updatedBed);
});

// @desc    Release bed (mark as vacant)
// @route   PUT /api/beds/release/:id
// @access  Private (Nurse, Staff)
export const releaseBed = asyncHandler(async (req, res) => {
  const bed = await Bed.findById(req.params.id);

  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }

  bed.status = 'Vacant';
  bed.currentPatient = null;
  bed.assignedDate = null;
  await bed.save();

  sendSuccess(res, bed);
});

// @desc    Update bed status
// @route   PUT /api/beds/:id
// @access  Private (Staff, Admin)
export const updateBed = asyncHandler(async (req, res) => {
  let bed = await Bed.findById(req.params.id);

  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }

  const { status, ward, notes } = req.body;

  if (status) {
    // If setting to vacant, clear patient
    if (status === 'Vacant') {
      bed.currentPatient = null;
      bed.assignedDate = null;
    }
    bed.status = status;
  }
  if (ward) bed.ward = ward;
  if (notes !== undefined) bed.notes = notes;

  await bed.save();

  const updatedBed = await Bed.findById(bed._id)
    .populate('currentPatient', 'name email phone');

  sendSuccess(res, updatedBed);
});
