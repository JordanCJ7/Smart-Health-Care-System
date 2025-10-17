import express from 'express';
import {
  createLabOrder,
  getPendingLabOrders,
  getAllLabOrders,
  getLabOrderById,
  updateLabResults,
  getPatientLabResults,
  updateLabOrderStatus,
  collectSample,
  rejectSample,
  addDoctorInterpretation,
  acknowledgeCriticalAlert,
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

// UC-003 Step 1, 3, 4: Create lab order (Staff - includes Doctor)
router.post(
  '/order',
  authorize('Staff', 'Admin'),
  createLabOrderValidation,
  validate,
  createLabOrder
);

// UC-003 Step 5: Get pending lab orders (Staff)
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

// UC-003 Step 6: Collect sample
router.put(
  '/collect-sample/:orderId',
  authorize('Staff', 'Admin'),
  collectSample
);

// UC-003 Step 7a (Extension): Reject sample due to poor quality
router.put(
  '/reject-sample/:orderId',
  authorize('Staff', 'Admin'),
  rejectSample
);

// UC-003 Step 7, 8, 8a, 9: Update lab results (Staff)
router.put(
  '/results/:orderId',
  authorize('Staff', 'Admin'),
  updateLabResultsValidation,
  validate,
  updateLabResults
);

// UC-003 Step 10: Add doctor interpretation
router.put(
  '/interpretation/:orderId',
  authorize('Staff', 'Admin'),
  addDoctorInterpretation
);

// UC-003 Step 8a (Extension): Acknowledge critical value alert
router.put(
  '/acknowledge-critical/:orderId',
  authorize('Staff', 'Admin'),
  acknowledgeCriticalAlert
);

// Update lab order status (Staff)
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
