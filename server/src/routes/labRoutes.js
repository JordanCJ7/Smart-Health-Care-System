import express from 'express';
import {
  createLabOrder,
  getPendingLabOrders,
  getAllLabOrders,
  getLabOrderById,
  updateLabResults,
  getPatientLabResults,
  updateLabOrderStatus,
} from '../controllers/labController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  createLabOrderValidation,
  updateLabResultsValidation,
  validate,
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create lab order (Staff only - merged from Doctor)
router.post(
  '/order',
  authorize('Staff', 'Admin'),
  createLabOrderValidation,
  validate,
  createLabOrder
);

// Get pending lab orders (Staff - merged from Lab Technician)
router.get(
  '/orders',
  authorize('Staff', 'Admin'),
  getPendingLabOrders
);

// Get all lab orders (Staff/Admin)
router.get(
  '/all',
  authorize('Staff', 'Admin'),
  getAllLabOrders
);

// Get specific lab order
router.get('/order/:id', getLabOrderById);

// Update lab results (Staff - merged from Lab Technician)
router.put(
  '/results/:orderId',
  authorize('Staff', 'Admin'),
  updateLabResultsValidation,
  validate,
  updateLabResults
);

// Update lab order status (Staff - merged from Lab Technician)
router.put(
  '/status/:orderId',
  authorize('Staff', 'Admin'),
  updateLabOrderStatus
);

// Get patient's lab results
router.get(
  '/patient/:patientId',
  getPatientLabResults
);

export default router;
