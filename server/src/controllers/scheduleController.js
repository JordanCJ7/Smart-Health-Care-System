import asyncHandler from 'express-async-handler';
import DoctorSchedule from '../models/DoctorSchedule.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Create or update doctor schedule
// @route   POST /api/schedules
// @access  Private (Staff/Admin)
export const createOrUpdateSchedule = asyncHandler(async (req, res) => {
  const { doctorId, date, location, department, slots, notes } = req.body;

  // Verify doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor || (doctor.role !== 'Staff' && doctor.role !== 'Doctor')) {
    res.status(400);
    throw new Error('Invalid doctor ID');
  }

  // Check if schedule already exists for this doctor and date
  let schedule = await DoctorSchedule.findOne({
    doctorId,
    date: new Date(date),
  });

  if (schedule) {
    // Update existing schedule
    schedule.location = location || schedule.location;
    schedule.department = department || schedule.department;
    schedule.notes = notes || schedule.notes;
    
    // Update slots if provided
    if (slots && slots.length > 0) {
      schedule.slots = slots.map((slot) => ({
        time: slot.time,
        status: slot.status || 'Available',
      }));
    }
    
    await schedule.save();
  } else {
    // Create new schedule
    schedule = await DoctorSchedule.create({
      doctorId,
      date: new Date(date),
      location,
      department: department || doctor.department,
      slots: slots.map((slot) => ({
        time: slot.time,
        status: slot.status || 'Available',
      })),
      notes,
    });
  }

  const populatedSchedule = await DoctorSchedule.findById(schedule._id)
    .populate('doctorId', 'name email specialization department');

  sendSuccess(res, populatedSchedule, schedule.isNew ? 201 : 200);
});

// @desc    Get available slots for a doctor
// @route   GET /api/schedules/available
// @access  Public
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, startDate, endDate, department, specialization } = req.query;

  // Build query
  const query = {
    isActive: true,
  };

  if (doctorId) {
    query.doctorId = doctorId;
  }

  if (department) {
    query.department = department;
  }

  // Date range filter
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  } else {
    // Default to future dates only
    query.date = { $gte: new Date() };
  }

  let schedules = await DoctorSchedule.find(query)
    .populate('doctorId', 'name email specialization department licenseNumber')
    .sort('date');

  // Filter by specialization if needed
  if (specialization) {
    schedules = schedules.filter(
      (schedule) => schedule.doctorId.specialization === specialization
    );
  }

  // Filter to only return available slots
  const availableSchedules = schedules.map((schedule) => ({
    _id: schedule._id,
    doctorId: schedule.doctorId,
    date: schedule.date,
    location: schedule.location,
    department: schedule.department,
    availableSlots: schedule.slots.filter((slot) => slot.status === 'Available'),
  }));

  sendSuccess(res, availableSchedules);
});

// @desc    Get doctor's schedule
// @route   GET /api/schedules/doctor/:doctorId
// @access  Private
export const getDoctorSchedule = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { startDate, endDate } = req.query;

  const query = {
    doctorId,
  };

  // Date range filter
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const schedules = await DoctorSchedule.find(query)
    .populate('doctorId', 'name email specialization department')
    .populate('slots.appointmentId', 'patientId reason status')
    .sort('date');

  sendSuccess(res, schedules);
});

// @desc    Hold a slot temporarily
// @route   POST /api/schedules/hold
// @access  Private
export const holdSlot = asyncHandler(async (req, res) => {
  const { scheduleId, time, holdDurationMinutes } = req.body;

  const schedule = await DoctorSchedule.findById(scheduleId);

  if (!schedule) {
    res.status(404);
    throw new Error('Schedule not found');
  }

  try {
    await schedule.holdSlot(time, req.user.id, holdDurationMinutes || 10);
    
    const updatedSchedule = await DoctorSchedule.findById(scheduleId)
      .populate('doctorId', 'name email specialization department');

    sendSuccess(res, {
      schedule: updatedSchedule,
      holdUntil: schedule.slots.find((s) => s.time === time)?.heldUntil,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Release a held slot
// @route   POST /api/schedules/release
// @access  Private
export const releaseSlot = asyncHandler(async (req, res) => {
  const { scheduleId, time } = req.body;

  const schedule = await DoctorSchedule.findById(scheduleId);

  if (!schedule) {
    res.status(404);
    throw new Error('Schedule not found');
  }

  await schedule.releaseSlot(time);

  sendSuccess(res, { message: 'Slot released successfully' });
});

// @desc    Block/unblock time slots
// @route   PUT /api/schedules/:id/block
// @access  Private (Staff/Admin)
export const blockSlots = asyncHandler(async (req, res) => {
  const { times, block } = req.body; // times: array of time strings, block: boolean

  const schedule = await DoctorSchedule.findById(req.params.id);

  if (!schedule) {
    res.status(404);
    throw new Error('Schedule not found');
  }

  times.forEach((time) => {
    const slot = schedule.slots.find((s) => s.time === time);
    if (slot && slot.status === 'Available') {
      slot.status = block ? 'Blocked' : 'Available';
    }
  });

  await schedule.save();

  sendSuccess(res, schedule);
});

// @desc    Get all schedules (Admin/Staff)
// @route   GET /api/schedules
// @access  Private (Admin/Staff)
export const getAllSchedules = asyncHandler(async (req, res) => {
  const { date, doctorId, department } = req.query;

  const query = {};
  if (date) query.date = new Date(date);
  if (doctorId) query.doctorId = doctorId;
  if (department) query.department = department;

  const schedules = await DoctorSchedule.find(query)
    .populate('doctorId', 'name email specialization department')
    .populate('slots.appointmentId', 'patientId reason status')
    .sort('date');

  sendSuccess(res, schedules);
});

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private (Admin)
export const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await DoctorSchedule.findById(req.params.id);

  if (!schedule) {
    res.status(404);
    throw new Error('Schedule not found');
  }

  // Check if any slots are booked
  const hasBookedSlots = schedule.slots.some((slot) => slot.status === 'Booked');
  if (hasBookedSlots) {
    res.status(400);
    throw new Error('Cannot delete schedule with booked appointments');
  }

  await schedule.deleteOne();

  sendSuccess(res, { message: 'Schedule deleted successfully' });
});
