import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAllAppointments,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  createAppointmentValidation,
  updateAppointmentValidation,
  validate,
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all appointments (staff/admin only)
router.get(
  '/all',
  authorize('Staff', 'Admin'),
  getAllAppointments
);

// Current user's appointments
router.get('/me', getMyAppointments);

// Create appointment
router.post(
  '/',
  createAppointmentValidation,
  validate,
  createAppointment
);

// Get, update, delete specific appointment
router
  .route('/:id')
  .get(getAppointmentById)
  .put(updateAppointmentValidation, validate, updateAppointment)
  .delete(authorize('Staff', 'Admin'), deleteAppointment);

export default router;
