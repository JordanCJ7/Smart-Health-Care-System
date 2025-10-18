import asyncHandler from 'express-async-handler';
import TriageRecord from '../models/TriageRecord.js';
import Bed from '../models/Bed.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import LabOrder from '../models/LabOrder.js';
import EPrescription from '../models/EPrescription.js';
import { sendSuccess } from '../utils/response.js';
import { createAuditLog, extractRequestMetadata } from '../utils/auditLogger.js';
import { notifyDoctor } from '../utils/notificationService.js';

// @desc    Verify patient identity by digital health card or patient ID
// @route   POST /api/triage/verify-patient
// @access  Private (Staff only)
export const verifyPatientIdentity = asyncHandler(async (req, res) => {
  const { patientId, digitalHealthCardId } = req.body;

  let patient;

  // UC-004 Step 2: Verify Patient Identity
  if (digitalHealthCardId) {
    patient = await User.findOne({ digitalHealthCardId }).select('-password');
  } else if (patientId) {
    patient = await User.findById(patientId).select('-password');
  }

  // Extension 2a: Patient details missing or incomplete
  if (!patient) {
    const metadata = extractRequestMetadata(req);
    await createAuditLog({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'VIEW_PATIENT_HISTORY',
      resource: 'Patient',
      details: 'Patient verification failed - patient not found',
      status: 'Failure',
      errorMessage: 'Patient details are missing or incomplete',
      ...metadata,
    });

    res.status(404);
    throw new Error('Patient details are missing or incomplete. Please contact support.');
  }

  // UC-004 Step 6: Generate Audit Log
  const metadata = extractRequestMetadata(req);
  await createAuditLog({
    userId: req.user._id,
    userRole: req.user.role,
    action: 'VIEW_PATIENT_HISTORY',
    resource: 'Patient',
    resourceId: patient._id,
    details: `Patient ${patient.name} verified successfully`,
    ...metadata,
  });

  sendSuccess(res, {
    patient: {
      id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodType: patient.bloodType,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      digitalHealthCardId: patient.digitalHealthCardId,
    }
  });
});

// @desc    Get patient medical history
// @route   GET /api/triage/patient-history/:patientId
// @access  Private (Staff only)
export const getPatientMedicalHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  // UC-004 Step 3: Access/Manage Patient Medical History
  const patient = await User.findById(patientId).select('-password');
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Fetch medical history data
  const [appointments, triageRecords, labOrders, prescriptions] = await Promise.all([
    Appointment.find({ patientId })
      .populate('doctorId', 'name specialization')
      .sort('-date')
      .limit(10),
    TriageRecord.find({ patientId })
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .limit(5),
    LabOrder.find({ patientId })
      .populate('doctorId', 'name specialization')
      .sort('-createdAt')
      .limit(10),
    EPrescription.find({ patientId })
      .populate('doctorId', 'name specialization')
      .sort('-createdAt')
      .limit(10),
  ]);

  // UC-004 Step 6: Generate Audit Log
  const metadata = extractRequestMetadata(req);
  await createAuditLog({
    userId: req.user._id,
    userRole: req.user.role,
    action: 'VIEW_PATIENT_HISTORY',
    resource: 'Patient',
    resourceId: patient._id,
    details: `Accessed medical history for patient ${patient.name}`,
    ...metadata,
  });

  sendSuccess(res, {
    patient: {
      id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodType: patient.bloodType,
      emergencyContact: patient.emergencyContact,
    },
    medicalHistory: {
      appointments,
      triageRecords,
      labOrders,
      prescriptions,
    }
  });
});

// @desc    Create triage record
// @route   POST /api/triage
// @access  Private (Staff only)
export const createTriageRecord = asyncHandler(async (req, res) => {
  const { patientId, vitals, symptoms, severityLevel, notes } = req.body;

  // UC-004 Step 1: Authenticate User (already done by protect middleware)
  // UC-004 Step 2: Verify patient exists
  const patient = await User.findById(patientId);
  
  // Extension 2a: Patient details missing
  if (!patient) {
    const metadata = extractRequestMetadata(req);
    await createAuditLog({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'CREATE_TRIAGE',
      resource: 'Triage',
      details: 'Triage creation failed - patient not found',
      status: 'Failure',
      errorMessage: 'Patient not found',
      ...metadata,
    });

    res.status(400);
    throw new Error('Patient not found. Please verify patient details or contact support.');
  }

  // UC-004 Step 4: Record Triage Details
  const triageRecord = await TriageRecord.create({
    patientId,
    vitals,
    symptoms,
    severityLevel,
    notes,
    createdBy: req.user.id,
    // UC-004 Step 7: If patient is Stable, place in priority queue
    admissionStatus: severityLevel === 'Stable' ? 'Queued' : 'Queued',
  });

  const populatedRecord = await TriageRecord.findById(triageRecord._id)
    .populate('patientId', 'name email phone dateOfBirth gender bloodType')
    .populate('createdBy', 'name');

  // UC-004 Step 6: Generate Audit Log
  const metadata = extractRequestMetadata(req);
  await createAuditLog({
    userId: req.user._id,
    userRole: req.user.role,
    action: 'CREATE_TRIAGE',
    resource: 'Triage',
    resourceId: triageRecord._id,
    details: `Created triage record for patient ${patient.name} with severity ${severityLevel}`,
    metadata: { patientId, severityLevel, symptoms },
    ...metadata,
  });

  sendSuccess(res, populatedRecord, 'Triage record created successfully', 201);
});

// @desc    Get all triage records (with priority queue sorting)
// @route   GET /api/triage
// @access  Private (Staff, Admin)
export const getTriageRecords = asyncHandler(async (req, res) => {
  const { status, severityLevel, patientId } = req.query;

  const query = {};
  if (status) query.admissionStatus = status;
  if (severityLevel) query.severityLevel = severityLevel;
  if (patientId) query.patientId = patientId;

  // UC-004 Step 7: Priority queue sorted by severity and arrival time
  // Define severity priority order (Critical > Urgent > Stable > Normal)
  const severityPriority = {
    'Critical': 1,
    'Urgent': 2,
    'Stable': 3,
    'Normal': 4
  };

  let records = await TriageRecord.find(query)
    .populate('patientId', 'name email phone dateOfBirth gender bloodType')
    .populate('assignedBed', 'bedNumber ward')
    .populate('createdBy', 'name')
    .lean();

  // Sort by severity priority first, then by arrival time (createdAt)
  records = records.sort((a, b) => {
    const priorityA = severityPriority[a.severityLevel] || 999;
    const priorityB = severityPriority[b.severityLevel] || 999;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB; // Lower number = higher priority
    }
    
    // If same severity, sort by arrival time (earlier = higher priority)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

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
// @access  Private (Staff, Admin)
export const updateTriageRecord = asyncHandler(async (req, res) => {
  let record = await TriageRecord.findById(req.params.id).populate('patientId', 'name');

  if (!record) {
    res.status(404);
    throw new Error('Triage record not found');
  }

  const { vitals, symptoms, severityLevel, admissionStatus, assignedBed, notes } = req.body;

  // UC-004 Step 3: Update patient medical information
  const oldData = { ...record.toObject() };

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

  // UC-004 Step 6: Generate Audit Log
  const metadata = extractRequestMetadata(req);
  await createAuditLog({
    userId: req.user._id,
    userRole: req.user.role,
    action: 'UPDATE_TRIAGE',
    resource: 'Triage',
    resourceId: record._id,
    details: `Updated triage record for patient ${record.patientId.name}`,
    metadata: { changes: req.body, oldData },
    ...metadata,
  });

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

  sendSuccess(res, bed, 'Bed created successfully', 201);
});

// @desc    Assign bed to patient
// @route   PUT /api/beds/assign
// @access  Private (Staff, Admin)
export const assignBed = asyncHandler(async (req, res) => {
  const { bedId, patientId, triageRecordId, notifyDoctorId } = req.body;

  // UC-004 Step 5: Manage Bed Availability
  // Check if bed exists and is available
  const bed = await Bed.findById(bedId);
  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }

  // Extension 5a: No beds available
  if (bed.status === 'Occupied') {
    const metadata = extractRequestMetadata(req);
    await createAuditLog({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'ASSIGN_BED',
      resource: 'Bed',
      resourceId: bedId,
      details: `Failed to assign bed ${bed.bedNumber} - already occupied`,
      status: 'Failure',
      errorMessage: 'Bed is already occupied',
      ...metadata,
    });

    res.status(400);
    throw new Error('Bed is already occupied. No beds available - patient added to waiting list.');
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

  // Update triage record if provided
  if (triageRecordId) {
    await TriageRecord.findByIdAndUpdate(triageRecordId, {
      assignedBed: bedId,
      admissionStatus: 'Admitted-ER',
    });
  }

  const updatedBed = await Bed.findById(bedId)
    .populate('currentPatient', 'name email phone');

  // UC-004 Step 6: Generate Audit Log
  const metadata = extractRequestMetadata(req);
  await createAuditLog({
    userId: req.user._id,
    userRole: req.user.role,
    action: 'ASSIGN_BED',
    resource: 'Bed',
    resourceId: bedId,
    details: `Assigned bed ${bed.bedNumber} (${bed.ward}) to patient ${patient.name}`,
    metadata: { bedId, patientId, triageRecordId },
    ...metadata,
  });

  // UC-004 Step 8: Notify Doctor about patient admission
  if (notifyDoctorId) {
    try {
      await notifyDoctor({
        doctorId: notifyDoctorId,
        senderId: req.user._id,
        type: 'PATIENT_ADMITTED',
        title: 'Patient Admission Notification',
        message: `Patient ${patient.name} has been admitted to bed ${bed.bedNumber} in ${bed.ward}. Please review triage details.`,
        priority: 'High',
        metadata: { patientId, bedId, triageRecordId },
      });

      // Audit log for notification
      await createAuditLog({
        userId: req.user._id,
        userRole: req.user.role,
        action: 'NOTIFY_DOCTOR',
        resource: 'Triage',
        resourceId: triageRecordId,
        details: `Notified doctor ${notifyDoctorId} about patient ${patient.name} admission`,
        metadata: { notifyDoctorId, patientId, bedId },
        ...metadata,
      });
    } catch (error) {
      // Extension 8a: System internal issue
      console.error('Error notifying doctor:', error);
      await createAuditLog({
        userId: req.user._id,
        userRole: req.user.role,
        action: 'NOTIFY_DOCTOR',
        resource: 'Triage',
        details: `Failed to notify doctor - system error`,
        status: 'Failure',
        errorMessage: error.message,
        ...metadata,
      });
      // Don't throw - bed assignment succeeded, notification failure is non-critical
    }
  }

  sendSuccess(res, updatedBed);
});

// @desc    Release bed (mark as vacant)
// @route   PUT /api/beds/release/:id
// @access  Private (Staff, Admin)
export const releaseBed = asyncHandler(async (req, res) => {
  const bed = await Bed.findById(req.params.id).populate('currentPatient', 'name');

  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }

  const previousPatient = bed.currentPatient;

  bed.status = 'Vacant';
  bed.currentPatient = null;
  bed.assignedDate = null;
  await bed.save();

  // UC-004 Step 6: Generate Audit Log
  const metadata = extractRequestMetadata(req);
  await createAuditLog({
    userId: req.user._id,
    userRole: req.user.role,
    action: 'RELEASE_BED',
    resource: 'Bed',
    resourceId: bed._id,
    details: `Released bed ${bed.bedNumber} (${bed.ward})${previousPatient ? ` - previously occupied by ${previousPatient.name}` : ''}`,
    metadata: { bedId: bed._id, previousPatientId: previousPatient?._id },
    ...metadata,
  });

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
