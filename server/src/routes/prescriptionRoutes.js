import express from 'express';
import {
  createPrescription,
  getPendingPrescriptions,
  getAllPrescriptions,
  searchPatients,
  getPrescriptionById,
  updatePrescriptionStatus,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  checkInventoryAvailability,
  requestClarification,
  suggestAlternative,
  dispensePrescription,
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

// Search patients (Staff/Admin)
router.get(
  '/search/patients',
  authorize('Staff', 'Admin'),
  searchPatients
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

// UC-001 Extension scenarios
// Check inventory availability (Step 4)
router.post(
  '/:id/check-inventory',
  authorize('Staff', 'Admin'),
  checkInventoryAvailability
);

// Request clarification from doctor (Extension 3a)
router.post(
  '/:id/clarify',
  authorize('Staff', 'Admin'),
  requestClarification
);

// Suggest alternative medication (Extension 4a)
router.post(
  '/:id/suggest-alternative',
  authorize('Staff', 'Admin'),
  suggestAlternative
);

// Dispense prescription with inventory check (Steps 5-8 + Extension 7a)
router.post(
  '/:id/dispense',
  authorize('Staff', 'Admin'),
  dispensePrescription
);

export default router;
