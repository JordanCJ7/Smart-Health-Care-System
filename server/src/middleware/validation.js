import { body, param, query, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg).join(', ');
    res.status(400);
    throw new Error(errorMessages);
  }
  next();
};

// Auth validation rules
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['Patient', 'Staff', 'Admin'])
    .withMessage('Invalid role. Valid roles are: Patient, Staff, Admin'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Appointment validation rules
export const createAppointmentValidation = [
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('reason').optional().trim(),
];

export const updateAppointmentValidation = [
  param('id').isMongoId().withMessage('Valid appointment ID is required'),
  body('status')
    .optional()
    .isIn(['Scheduled', 'Completed', 'Cancelled', 'No-Show'])
    .withMessage('Invalid status'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('time').optional().trim(),
];

// Triage validation rules
export const createTriageValidation = [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('vitals.bp').notEmpty().withMessage('Blood pressure is required'),
  body('vitals.hr').isNumeric().withMessage('Heart rate must be a number'),
  body('vitals.temp').isNumeric().withMessage('Temperature must be a number'),
  body('symptoms').notEmpty().withMessage('Symptoms are required'),
  body('severityLevel')
    .isIn(['Critical', 'Urgent', 'Stable', 'Normal'])
    .withMessage('Invalid severity level'),
];

// Bed validation rules
export const assignBedValidation = [
  body('bedId').isMongoId().withMessage('Valid bed ID is required'),
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
];

// Lab order validation rules
export const createLabOrderValidation = [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('testType').notEmpty().withMessage('Test type is required'),
  body('priority')
    .optional()
    .isIn(['Routine', 'Urgent', 'STAT'])
    .withMessage('Invalid priority'),
  body('clinicalNotes').optional().trim(),
];

export const updateLabResultsValidation = [
  param('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('results').notEmpty().withMessage('Results are required'),
  body('criticalValues').optional().isArray().withMessage('Critical values must be an array'),
];

// Prescription validation rules
export const createPrescriptionValidation = [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('medications').isArray({ min: 1 }).withMessage('At least one medication is required'),
  body('medications.*.name').notEmpty().withMessage('Medication name is required'),
  body('medications.*.dosage').notEmpty().withMessage('Dosage is required'),
  body('medications.*.frequency').notEmpty().withMessage('Frequency is required'),
];

export const updatePrescriptionValidation = [
  param('id').isMongoId().withMessage('Valid prescription ID is required'),
  body('status')
    .isIn(['Pending', 'Dispensed', 'Rejected', 'Expired'])
    .withMessage('Invalid status'),
];

// Profile validation rules
export const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date is required'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  body('address').optional().trim(),
  body('emergencyContact.name').optional().trim(),
  body('emergencyContact.relationship').optional().trim(),
  body('emergencyContact.phone').optional().trim(),
  body('insurance.provider').optional().trim(),
  body('insurance.policyNumber').optional().trim(),
  body('insurance.groupNumber').optional().trim(),
  body('specialization').optional().trim(),
  body('department').optional().trim(),
];

export const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];
