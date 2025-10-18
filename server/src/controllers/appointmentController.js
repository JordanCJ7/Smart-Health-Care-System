import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import DoctorSchedule from '../models/DoctorSchedule.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { sendSuccess } from '../utils/response.js';
import { generateICSFile } from '../utils/calendarUtils.js';
import { sendAppointmentConfirmation } from '../utils/notificationService.js';

// @desc    Create appointment (UC-002 Step 6)
// @route   POST /api/appointments
// @access  Private
export const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, time, department, reason, notes, scheduleId, paymentId } = req.body;

  // Verify doctor exists and has Staff role with specialization
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'Staff' || !doctor.specialization) {
    res.status(400);
    throw new Error('Invalid doctor ID');
  }

  // Patient ID comes from authenticated user
  const patientId = req.user.role === 'Patient' ? req.user.id : req.body.patientId;

  if (!patientId) {
    res.status(400);
    throw new Error('Patient ID is required');
  }

  // Get patient details
  const patient = await User.findById(patientId);
  if (!patient) {
    res.status(400);
    throw new Error('Invalid patient ID');
  }

  // UC-002 Step 5: Check payment if required (payment rules by hospital type)
  if (paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== 'Completed' || payment.userId.toString() !== patientId) {
      res.status(400);
      throw new Error('Valid completed payment is required');
    }
  }

  // Start a session for transaction (UC-002 Step 6: Atomic update)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // UC-002 Step 6a: Check for concurrency conflict
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      time,
      status: { $in: ['Scheduled'] },
    }).session(session);

    if (existingAppointment) {
      await session.abortTransaction();
      session.endSession();
      res.status(409); // Conflict
      throw new Error('This time slot is already taken. Please select another slot.');
    }

    // Create appointment with BOOKED status
    const appointment = await Appointment.create(
      [
        {
          patientId,
          doctorId,
          date: new Date(date),
          time,
          department: department || doctor.department,
          reason,
          notes,
          createdBy: req.user.id,
          status: 'Scheduled',
        },
      ],
      { session }
    );

    // UC-002 Step 6: Update doctor schedule if scheduleId provided
    if (scheduleId) {
      const schedule = await DoctorSchedule.findById(scheduleId).session(session);
      if (schedule) {
        try {
          await schedule.bookSlot(time, appointment[0]._id);
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          res.status(400);
          throw new Error(error.message);
        }
      }
    }

    // Link payment to appointment if provided
    if (paymentId) {
      await Payment.findByIdAndUpdate(
        paymentId,
        { appointmentId: appointment[0]._id },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    // Populate appointment details
    const populatedAppointment = await Appointment.findById(appointment[0]._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialization department');

    // UC-002 Step 7: Send confirmation notification (async, non-blocking)
    try {
      await sendAppointmentConfirmation({
        appointmentId: populatedAppointment._id,
        patientId: populatedAppointment.patientId._id,
        patientName: populatedAppointment.patientId.name,
        patientEmail: populatedAppointment.patientId.email,
        doctorName: populatedAppointment.doctorId.name,
        doctorSpecialization: populatedAppointment.doctorId.specialization,
        date: populatedAppointment.date,
        time: populatedAppointment.time,
        department: populatedAppointment.department,
        reason: populatedAppointment.reason,
      });
    } catch (notificationError) {
      // UC-002 Extension 7a: Keep booking even if notification fails
      console.error('Notification failed:', notificationError);
      // Flag for manual follow-up could be added here
    }

    // UC-002 Step 7: Generate ICS calendar file
    const icsFile = generateICSFile({
      title: `Appointment with Dr. ${populatedAppointment.doctorId.name}`,
      description: reason || 'Medical appointment',
      location: populatedAppointment.department || 'Hospital',
      startDate: populatedAppointment.date,
      startTime: populatedAppointment.time,
      duration: 30, // Default 30 minutes
    });

    sendSuccess(res, {
      appointment: populatedAppointment,
      icsFile,
    }, 'Appointment created successfully', 201);
  } catch (error) {
    // Only abort if transaction is still active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    throw error;
  }
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
