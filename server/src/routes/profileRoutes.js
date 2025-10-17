import express from 'express';
import { getUserProfile, updateUserProfile, updatePassword } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/v1/profile
// @desc    Get authenticated user's profile with role-specific data
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/v1/profile
// @desc    Update authenticated user's profile
// @access  Private
const profileUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('gender').optional().isIn(['Male', 'Female', 'Other', '']).withMessage('Invalid gender'),
  body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']).withMessage('Invalid blood type'),
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

router.put('/profile', protect, profileUpdateValidation, validate, updateUserProfile);

// @route   PUT /api/v1/profile/password
// @desc    Update password
// @access  Private
const passwordUpdateValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

router.put('/profile/password', protect, passwordUpdateValidation, validate, updatePassword);

export default router;
