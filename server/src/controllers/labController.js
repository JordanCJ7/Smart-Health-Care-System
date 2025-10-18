import asyncHandler from 'express-async-handler';
import LabOrder from '../models/LabOrder.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Create lab order (UC-003 Step 1, 3, 4)
// @route   POST /api/labs/order
// @access  Private (Staff - includes Doctor role)
export const createLabOrder = asyncHandler(async (req, res) => {
  const { patientId, testType, priority, clinicalNotes } = req.body;

  // Step 2: Verify patient exists and record is valid
  const patient = await User.findById(patientId);
  if (!patient) {
    res.status(400);
    throw new Error('Patient not found');
  }

  if (!patient.isActive) {
    res.status(400);
    throw new Error('Patient record is inactive. Please resolve the record issue before proceeding.');
  }

  // Step 3-4: Create lab order with clinical notes
  const labOrder = await LabOrder.create({
    patientId,
    doctorId: req.user.id,
    testType,
    priority: priority || 'Routine',
    clinicalNotes,
  });

  const populatedOrder = await LabOrder.findById(labOrder._id)
    .populate('patientId', 'name email phone dateOfBirth gender')
    .populate('doctorId', 'name specialization department');

  // Step 5: Notification sent to laboratory queue (simulated here)
  // In production, this would trigger a real-time notification system
  console.log(`[LAB QUEUE NOTIFICATION] New ${priority} lab order: ${testType} for patient ${patient.name}`);

  sendSuccess(res, populatedOrder, 'Lab order created successfully', 201);
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

  // Check authorization (Staff includes doctors and lab technicians)
  const isAuthorized =
    req.user.role === 'Staff' ||
    req.user.role === 'Admin' ||
    order.patientId._id.toString() === req.user.id ||
    order.doctorId._id.toString() === req.user.id;

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to view this lab order');
  }

  sendSuccess(res, order);
});

// @desc    Update lab order results (UC-003 Step 7, 8, 8a, 9)
// @route   PUT /api/labs/results/:orderId
// @access  Private (Staff)
export const updateLabResults = asyncHandler(async (req, res) => {
  const { results, notes, status, criticalValues } = req.body;

  let order = await LabOrder.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  // Step 7: Lab technician performs analysis and enters results
  if (results) order.results = results;
  if (notes !== undefined) order.notes = notes;
  if (status) {
    order.status = status;
  } else {
    // Auto-set to completed if results are provided (Step 8)
    order.status = 'Completed';
  }

  order.completedBy = req.user.id;
  order.completedAt = new Date();

  // Step 8a: Check for critical values (Extension)
  // In production, this would use reference ranges from a test catalog
  if (criticalValues && criticalValues.length > 0) {
    order.criticalAlert = {
      isCritical: true,
      flaggedAt: new Date(),
      alertMessage: `Critical values detected: ${criticalValues.join(', ')}`,
    };

    // Send high-priority alert to doctor (simulated)
    console.log(`[CRITICAL ALERT] Order ${order._id}: Critical values detected. Sending high-priority alert to Dr. ${order.doctorId}`);
  }

  // Step 9: Send notification to ordering doctor
  order.notificationSent = true;
  order.notificationSentAt = new Date();

  await order.save();

  const updatedOrder = await LabOrder.findById(order._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .populate('completedBy', 'name');

  // Simulated notification (Step 9)
  console.log(`[RESULTS NOTIFICATION] Lab results available for order ${order._id}. Notifying Dr. ${updatedOrder.doctorId.name}`);

  sendSuccess(res, updatedOrder);
});

// @desc    Get patient's lab results
// @route   GET /api/labs/patient/:patientId
// @access  Private (Doctor, Patient, Staff)
export const getPatientLabResults = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  // Check authorization (Staff includes doctors)
  const isAuthorized =
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

// @desc    Update lab order status (UC-003 Step 6)
// @route   PUT /api/labs/status/:orderId
// @access  Private (Staff)
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
  
  // Track sample collection (Step 6)
  if (status === 'Sample-Collected' && !order.sampleCollectedBy) {
    order.sampleCollectedBy = req.user.id;
    order.sampleCollectedAt = new Date();
  }

  await order.save();

  const updatedOrder = await LabOrder.findById(order._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .populate('sampleCollectedBy', 'name');

  sendSuccess(res, updatedOrder);
});

// @desc    Collect sample for lab order (UC-003 Step 6)
// @route   PUT /api/labs/collect-sample/:orderId
// @access  Private (Staff)
export const collectSample = asyncHandler(async (req, res) => {
  const order = await LabOrder.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  if (order.status !== 'Ordered') {
    res.status(400);
    throw new Error('Sample can only be collected for orders with status "Ordered"');
  }

  // Step 6: Sample collection by phlebotomist/staff
  order.status = 'Sample-Collected';
  order.sampleCollectedBy = req.user.id;
  order.sampleCollectedAt = new Date();

  await order.save();

  const updatedOrder = await LabOrder.findById(order._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .populate('sampleCollectedBy', 'name');

  sendSuccess(res, updatedOrder);
});

// @desc    Reject sample due to poor quality (UC-003 Step 7a - Extension)
// @route   PUT /api/labs/reject-sample/:orderId
// @access  Private (Staff)
export const rejectSample = asyncHandler(async (req, res) => {
  const { rejectionReason, qualityStatus } = req.body;

  if (!rejectionReason) {
    res.status(400);
    throw new Error('Rejection reason is required');
  }

  const order = await LabOrder.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  // Step 7a: Lab technician flags poor sample quality
  order.status = 'Sample-Rejected';
  order.sampleQuality = {
    status: qualityStatus || 'Poor',
    rejectionReason,
    rejectedBy: req.user.id,
    rejectedAt: new Date(),
  };

  await order.save();

  const updatedOrder = await LabOrder.findById(order._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .populate('sampleQuality.rejectedBy', 'name');

  // Notify doctor and sample collection staff (simulated)
  console.log(`[SAMPLE REJECTION ALERT] Order ${order._id}: ${rejectionReason}. Notifying doctor and collection staff.`);

  sendSuccess(res, updatedOrder);
});

// @desc    Add doctor interpretation (UC-003 Step 10)
// @route   PUT /api/labs/interpretation/:orderId
// @access  Private (Staff - Doctor role)
export const addDoctorInterpretation = asyncHandler(async (req, res) => {
  const { interpretation, followUpActions } = req.body;

  if (!interpretation) {
    res.status(400);
    throw new Error('Interpretation is required');
  }

  const order = await LabOrder.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  if (order.status !== 'Completed') {
    res.status(400);
    throw new Error('Can only add interpretation to completed lab orders');
  }

  // Verify the doctor is authorized (ordering doctor)
  if (order.doctorId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Only the ordering doctor can add interpretation');
  }

  // Step 10: Doctor reviews and adds interpretation
  order.doctorInterpretation = {
    interpretation,
    followUpActions,
    interpretedAt: new Date(),
  };

  await order.save();

  const updatedOrder = await LabOrder.findById(order._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .populate('completedBy', 'name');

  sendSuccess(res, updatedOrder);
});

// @desc    Acknowledge critical value alert (UC-003 Step 8a - Extension)
// @route   PUT /api/labs/acknowledge-critical/:orderId
// @access  Private (Staff - Doctor role)
export const acknowledgeCriticalAlert = asyncHandler(async (req, res) => {
  const order = await LabOrder.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  if (!order.criticalAlert.isCritical) {
    res.status(400);
    throw new Error('This order does not have a critical alert');
  }

  if (order.criticalAlert.acknowledgedBy) {
    res.status(400);
    throw new Error('Critical alert already acknowledged');
  }

  // Verify the doctor is authorized (ordering doctor)
  if (order.doctorId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Only the ordering doctor can acknowledge the critical alert');
  }

  // Step 8a: Doctor acknowledges critical value alert
  order.criticalAlert.acknowledgedBy = req.user.id;
  order.criticalAlert.acknowledgedAt = new Date();

  await order.save();

  const updatedOrder = await LabOrder.findById(order._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name specialization')
    .populate('criticalAlert.acknowledgedBy', 'name');

  sendSuccess(res, updatedOrder);
});
