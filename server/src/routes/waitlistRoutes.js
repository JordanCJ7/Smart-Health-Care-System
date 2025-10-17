import express from 'express';
import {
  addToWaitlist,
  getMyWaitlist,
  getDoctorWaitlist,
  notifyWaitlistPatient,
  cancelWaitlistEntry,
  fulfillWaitlistEntry,
} from '../controllers/waitlistController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Patient routes
router.post('/', addToWaitlist);
router.get('/me', getMyWaitlist);

// Staff/Admin routes
router.get('/doctor/:doctorId', authorize('Staff', 'Admin'), getDoctorWaitlist);
router.post('/notify/:id', authorize('Staff', 'Admin'), notifyWaitlistPatient);
router.put('/:id/fulfill', authorize('Staff', 'Admin'), fulfillWaitlistEntry);

// Cancel entry (patient or staff)
router.delete('/:id', cancelWaitlistEntry);

export default router;
