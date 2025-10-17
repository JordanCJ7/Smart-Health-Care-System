import express from 'express';
import {
  verifyPatientIdentity,
  getPatientMedicalHistory,
  createTriageRecord,
  getTriageRecords,
  getTriageRecordById,
  updateTriageRecord,
  getAllBeds,
  getBedById,
  createBed,
  assignBed,
  releaseBed,
  updateBed,
} from '../controllers/triageController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  createTriageValidation,
  assignBedValidation,
  validate,
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// UC-004 Step 2: Verify Patient Identity
router.post(
  '/triage/verify-patient',
  authorize('Staff', 'Admin'),
  verifyPatientIdentity
);

// UC-004 Step 3: Access/Manage Patient Medical History
router.get(
  '/triage/patient-history/:patientId',
  authorize('Staff', 'Admin'),
  getPatientMedicalHistory
);

// Triage routes
router
  .route('/triage')
  .post(
    authorize('Staff', 'Admin'),
    createTriageValidation,
    validate,
    createTriageRecord
  )
  .get(
    authorize('Staff', 'Admin'),
    getTriageRecords
  );

router
  .route('/triage/:id')
  .get(getTriageRecordById)
  .put(
    authorize('Staff', 'Admin'),
    updateTriageRecord
  );

// Bed routes
router
  .route('/beds')
  .get(
    authorize('Staff', 'Admin'),
    getAllBeds
  )
  .post(
    authorize('Staff', 'Admin'),
    createBed
  );

router.put(
  '/beds/assign',
  authorize('Staff', 'Admin'),
  assignBedValidation,
  validate,
  assignBed
);

router.put(
  '/beds/release/:id',
  authorize('Staff', 'Admin'),
  releaseBed
);

router
  .route('/beds/:id')
  .get(getBedById)
  .put(
    authorize('Staff', 'Admin'),
    updateBed
  );

export default router;
