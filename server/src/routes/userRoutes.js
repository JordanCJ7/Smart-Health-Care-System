/**
 * User Routes (Staff-accessible)
 * 
 * Routes for staff to access user information
 * All routes require authentication and Staff or Admin role
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

/**
 * @desc    Get all patients (Staff-accessible)
 * @route   GET /api/users/patients
 * @access  Private/Staff/Admin
 */
router.get('/patients', protect, authorize('Staff', 'Admin'), asyncHandler(async (req, res) => {
  try {
    const patients = await User.find({ role: 'Patient' })
      .select('-password')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: patients,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || 'Failed to fetch patients'
    });
  }
}));

/**
 * @desc    Get all staff members (Staff-accessible)
 * @route   GET /api/users/staff
 * @access  Private/Staff/Admin
 */
router.get('/staff', protect, authorize('Staff', 'Admin'), asyncHandler(async (req, res) => {
  try {
    const staff = await User.find({ role: 'Staff' })
      .select('-password')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: staff,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || 'Failed to fetch staff'
    });
  }
}));

export default router;
