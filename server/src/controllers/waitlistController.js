import asyncHandler from 'express-async-handler';
import Waitlist from '../models/Waitlist.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Add patient to waitlist (UC-002 Extension 3a)
// @route   POST /api/waitlist
// @access  Private
export const addToWaitlist = asyncHandler(async (req, res) => {
  const { doctorId, preferredDate, alternativeDates, department, reason } = req.body;

  // Verify doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'Staff' || !doctor.specialization) {
    res.status(400);
    throw new Error('Invalid doctor ID');
  }

  const patientId = req.user.role === 'Patient' ? req.user.id : req.body.patientId;

  if (!patientId) {
    res.status(400);
    throw new Error('Patient ID is required');
  }

  // Check if patient already on waitlist for this doctor and date
  const existingEntry = await Waitlist.findOne({
    patientId,
    doctorId,
    preferredDate: new Date(preferredDate),
    status: 'Active',
  });

  if (existingEntry) {
    res.status(400);
    throw new Error('You are already on the waitlist for this doctor and date');
  }

  // Set expiration (default 30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const waitlistEntry = await Waitlist.create({
    patientId,
    doctorId,
    preferredDate: new Date(preferredDate),
    alternativeDates: alternativeDates?.map((d) => new Date(d)),
    department: department || doctor.department,
    reason,
    expiresAt,
  });

  const populatedEntry = await Waitlist.findById(waitlistEntry._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email specialization department');

  sendSuccess(res, populatedEntry, 'Added to waitlist successfully', 201);
});

// @desc    Get user's waitlist entries
// @route   GET /api/waitlist/me
// @access  Private
export const getMyWaitlist = asyncHandler(async (req, res) => {
  const patientId = req.user.id;

  const entries = await Waitlist.find({
    patientId,
    status: { $in: ['Active', 'Fulfilled'] },
  })
    .populate('doctorId', 'name email specialization department')
    .populate('fulfilledAppointmentId', 'date time status')
    .sort('-createdAt');

  sendSuccess(res, entries);
});

// @desc    Get waitlist for a doctor (Staff/Admin)
// @route   GET /api/waitlist/doctor/:doctorId
// @access  Private (Staff/Admin)
export const getDoctorWaitlist = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { status } = req.query;

  const query = {
    doctorId,
  };

  if (status) {
    query.status = status;
  } else {
    query.status = 'Active';
  }

  const entries = await Waitlist.find(query)
    .populate('patientId', 'name email phone')
    .sort('createdAt'); // FIFO order

  sendSuccess(res, entries);
});

// @desc    Notify waitlist when slot becomes available
// @route   POST /api/waitlist/notify/:id
// @access  Private (Staff/Admin)
export const notifyWaitlistPatient = asyncHandler(async (req, res) => {
  const entry = await Waitlist.findById(req.params.id)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name specialization');

  if (!entry) {
    res.status(404);
    throw new Error('Waitlist entry not found');
  }

  if (entry.status !== 'Active') {
    res.status(400);
    throw new Error('Waitlist entry is not active');
  }

  const { availableDate, availableTime } = req.body;

  // Create notification
  await Notification.create({
    recipientId: entry.patientId._id,
    senderId: req.user.id,
    type: 'GENERAL',
    title: 'Appointment Slot Available',
    message: `A slot is now available with Dr. ${entry.doctorId.name} on ${availableDate} at ${availableTime}. Please book soon as slots fill quickly.`,
    priority: 'High',
    metadata: {
      waitlistId: entry._id,
      doctorId: entry.doctorId._id,
      availableDate,
      availableTime,
    },
  });

  // Increment notification count
  entry.notificationsSent += 1;
  await entry.save();

  sendSuccess(res, { message: 'Patient notified successfully', entry });
});

// @desc    Cancel waitlist entry
// @route   DELETE /api/waitlist/:id
// @access  Private
export const cancelWaitlistEntry = asyncHandler(async (req, res) => {
  const entry = await Waitlist.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Waitlist entry not found');
  }

  // Check authorization
  const isAuthorized =
    req.user.role === 'Staff' ||
    req.user.role === 'Admin' ||
    entry.patientId.toString() === req.user.id;

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to cancel this waitlist entry');
  }

  entry.status = 'Cancelled';
  await entry.save();

  sendSuccess(res, { message: 'Waitlist entry cancelled successfully' });
});

// @desc    Fulfill waitlist entry with appointment
// @route   PUT /api/waitlist/:id/fulfill
// @access  Private (Staff/Admin)
export const fulfillWaitlistEntry = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;

  const entry = await Waitlist.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Waitlist entry not found');
  }

  if (entry.status !== 'Active') {
    res.status(400);
    throw new Error('Waitlist entry is not active');
  }

  entry.status = 'Fulfilled';
  entry.fulfilledAppointmentId = appointmentId;
  await entry.save();

  sendSuccess(res, entry);
});
