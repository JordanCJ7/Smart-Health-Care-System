import express from 'express';
import {
  createPrescription,
  getPendingPrescriptions,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
  getPatientPrescriptions,
  getDoctorPrescriptions,
} from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  createPrescriptionValidation,
  updatePrescriptionValidation,
  validate,
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create prescription (Staff only - merged from Doctor)
router.post(
  '/',
  authorize('Staff', 'Admin'),
  createPrescriptionValidation,
  validate,
  createPrescription
);

// Get pending prescriptions (Staff - merged from Pharmacist)
router.get(
  '/pending',
  authorize('Staff', 'Admin'),
  getPendingPrescriptions
);

// Get all prescriptions (Staff/Admin)
router.get(
  '/all',
  authorize('Staff', 'Admin'),
  getAllPrescriptions
);

// Get staff member's prescriptions (merged from doctor route)
router.get(
  '/staff/me',
  authorize('Staff', 'Admin'),
  getDoctorPrescriptions
);

// Get patient's prescriptions
router.get(
  '/patient/:patientId',
  getPatientPrescriptions
);

// Get, update specific prescription
router
  .route('/:id')
  .get(getPrescriptionById)
  .put(
    authorize('Staff', 'Admin'),
    updatePrescriptionValidation,
    validate,
    updatePrescriptionStatus
  );

export default router;
