import express from 'express';
import {
  createPayment,
  executePayment,
  getMyPayments,
  getPaymentById,
  getAllPayments,
  refundPayment,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create payment
router.post('/', createPayment);

// Execute payment (after PayPal approval)
router.post('/execute', executePayment);

// Get user's payments
router.get('/me', getMyPayments);

// Get all payments (Admin/Staff)
router.get('/all', authorize('Staff', 'Admin'), getAllPayments);

// Get payment by ID
router.get('/:id', getPaymentById);

// Refund payment (Admin/Staff)
router.post('/refund/:id', authorize('Staff', 'Admin'), refundPayment);

export default router;
