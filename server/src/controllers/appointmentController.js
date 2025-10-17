import asyncHandler from 'express-async-handler';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, time, department, reason, notes } = req.body;

  // Verify doctor exists and has Doctor role
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'Doctor') {
    res.status(400);
    throw new Error('Invalid doctor ID');
  }

  // Patient ID comes from authenticated user
  const patientId = req.user.role === 'Patient' ? req.user.id : req.body.patientId;

  if (!patientId) {
    res.status(400);
    throw new Error('Patient ID is required');
  }

  // Check for conflicting appointments (same doctor, date, time)
  const existingAppointment = await Appointment.findOne({
    doctorId,
    date: new Date(date),
    time,
    status: { $in: ['Scheduled'] },
  });

  if (existingAppointment) {
    res.status(400);
    throw new Error('This time slot is already booked');
  }

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    date: new Date(date),
    time,
    department: department || doctor.department,
    reason,
    notes,
    createdBy: req.user.id,
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email specialization department');

  sendSuccess(res, populatedAppointment, 201);
});

// @desc    Get all appointments for current user
// @route   GET /api/appointments/me
// @access  Private
export const getMyAppointments = asyncHandler(async (req, res) => {
  let query = {};

  // Filter based on user role
  if (req.user.role === 'Patient') {
    query.patientId = req.user.id;
  } else if (req.user.role === 'Staff') {
    // Staff members with specialization (doctors) see their appointments
    if (req.user.specialization) {
      query.doctorId = req.user.id;
    } else {
      // Other staff can see all appointments
      query = {};
    }
  } else {
    // Admin can see all appointments
    query = {};
  }

  const appointments = await Appointment.find(query)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email specialization department')
    .sort('-date');

  sendSuccess(res, appointments);
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email specialization department');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Check authorization
  const isAuthorized =
    req.user.role === 'Staff' ||
    req.user.role === 'Admin' ||
    appointment.patientId._id.toString() === req.user.id ||
    appointment.doctorId._id.toString() === req.user.id;

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to view this appointment');
  }

  sendSuccess(res, appointment);
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = asyncHandler(async (req, res) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Check authorization
  const isAuthorized =
    req.user.role === 'Staff' ||
    req.user.role === 'Admin' ||
    appointment.patientId.toString() === req.user.id ||
    appointment.doctorId.toString() === req.user.id;

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to update this appointment');
  }

  // Update fields
  const { status, date, time, notes, reason } = req.body;

  if (status) appointment.status = status;
  if (date) appointment.date = new Date(date);
  if (time) appointment.time = time;
  if (notes !== undefined) appointment.notes = notes;
  if (reason !== undefined) appointment.reason = reason;

  await appointment.save();

  const updatedAppointment = await Appointment.findById(appointment._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email specialization department');

  sendSuccess(res, updatedAppointment);
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Staff/Admin only)
export const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  await appointment.deleteOne();

  sendSuccess(res, { message: 'Appointment deleted successfully' });
});

// @desc    Get all appointments (Admin/Staff)
// @route   GET /api/appointments
// @access  Private (Admin/Staff)
export const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, date, doctorId, patientId } = req.query;

  const query = {};

  if (status) query.status = status;
  if (date) query.date = new Date(date);
  if (doctorId) query.doctorId = doctorId;
  if (patientId) query.patientId = patientId;

  const appointments = await Appointment.find(query)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email specialization department')
    .sort('-date');

  sendSuccess(res, appointments);
});
