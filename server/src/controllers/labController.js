import asyncHandler from 'express-async-handler';
import LabOrder from '../models/LabOrder.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Create lab order
// @route   POST /api/labs/order
// @access  Private (Doctor only)
export const createLabOrder = asyncHandler(async (req, res) => {
  const { patientId, testType, priority, notes } = req.body;

  // Verify patient exists
  const patient = await User.findById(patientId);
  if (!patient) {
    res.status(400);
    throw new Error('Patient not found');
  }

  const labOrder = await LabOrder.create({
    patientId,
    doctorId: req.user.id,
    testType,
    priority: priority || 'Routine',
    notes,
  });

  const populatedOrder = await LabOrder.findById(labOrder._id)
    .populate('patientId', 'name email phone dateOfBirth gender')
    .populate('doctorId', 'name specialization department');

  sendSuccess(res, populatedOrder, 201);
});

// @desc    Get pending lab orders (for lab technicians)
// @route   GET /api/labs/orders
// @access  Private (LabTechnician)
export const getPendingLabOrders = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;

  const query = {};
  
  // Default to non-completed orders
  if (status) {
    query.status = status;
  } else {
    query.status = { $in: ['Ordered', 'Sample-Collected', 'Processing'] };
  }

  if (priority) query.priority = priority;

  const orders = await LabOrder.find(query)
    .populate('patientId', 'name email phone dateOfBirth gender')
    .populate('doctorId', 'name specialization department')
    .sort('-priority createdAt');

  sendSuccess(res, orders);
});

// @desc    Get all lab orders (for staff/admin)
// @route   GET /api/labs/all
// @access  Private (Staff, Admin)
export const getAllLabOrders = asyncHandler(async (req, res) => {
  const { status, patientId, doctorId, priority } = req.query;

  const query = {};
  if (status) query.status = status;
  if (patientId) query.patientId = patientId;
  if (doctorId) query.doctorId = doctorId;
  if (priority) query.priority = priority;

  const orders = await LabOrder.find(query)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .populate('completedBy', 'name')
    .sort('-createdAt');

  sendSuccess(res, orders);
});

// @desc    Get lab order by ID
// @route   GET /api/labs/order/:id
// @access  Private
export const getLabOrderById = asyncHandler(async (req, res) => {
  const order = await LabOrder.findById(req.params.id)
    .populate('patientId', 'name email phone dateOfBirth gender')
    .populate('doctorId', 'name specialization department')
    .populate('completedBy', 'name');

  if (!order) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  // Check authorization
  const isAuthorized =
    req.user.role === 'Staff' ||
    req.user.role === 'Admin' ||
    req.user.role === 'LabTechnician' ||
    order.patientId._id.toString() === req.user.id ||
    order.doctorId._id.toString() === req.user.id;

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to view this lab order');
  }

  sendSuccess(res, order);
});

// @desc    Update lab order results
// @route   PUT /api/labs/results/:orderId
// @access  Private (LabTechnician only)
export const updateLabResults = asyncHandler(async (req, res) => {
  const { results, notes, status } = req.body;

  let order = await LabOrder.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  // Update results and status
  if (results) order.results = results;
  if (notes !== undefined) order.notes = notes;
  if (status) {
    order.status = status;
  } else {
    // Auto-set to completed if results are provided
    order.status = 'Completed';
  }

  order.completedBy = req.user.id;
  order.completedAt = new Date();

  await order.save();

  const updatedOrder = await LabOrder.findById(order._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .populate('completedBy', 'name');

  sendSuccess(res, updatedOrder);
});

// @desc    Get patient's lab results
// @route   GET /api/labs/patient/:patientId
// @access  Private (Doctor, Patient, Staff)
export const getPatientLabResults = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  // Check authorization
  const isAuthorized =
    req.user.role === 'Doctor' ||
    req.user.role === 'Staff' ||
    req.user.role === 'Admin' ||
    req.user.id === patientId;

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to view these lab results');
  }

  const orders = await LabOrder.find({ patientId })
    .populate('doctorId', 'name specialization')
    .populate('completedBy', 'name')
    .sort('-createdAt');

  sendSuccess(res, orders);
});

// @desc    Update lab order status
// @route   PUT /api/labs/status/:orderId
// @access  Private (LabTechnician)
export const updateLabOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const order = await LabOrder.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  order.status = status;
  await order.save();

  const updatedOrder = await LabOrder.findById(order._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization');

  sendSuccess(res, updatedOrder);
});
