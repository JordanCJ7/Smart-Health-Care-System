/**
 * Admin User Management Controller
 * 
 * Handles user creation, management, and administration features
 * for admin-only operations
 */

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * @desc    Create a new user (Admin only)
 * @route   POST /api/admin/users
 * @access  Private/Admin
 * 
 * Request Body:
 * {
 *   name: string (required),
 *   email: string (required, unique),
 *   password: string (required),
 *   phone: string (optional),
 *   specialization: string (optional) - if provided, user is a Doctor
 *   department: string (optional),
 *   licenseNumber: string (optional)
 * }
 * 
 * Note: role is always set to 'Staff' by default for admin-created users
 * If specialization is provided, user will be displayed as 'Doctor' on frontend
 */
export const createUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    specialization,
    department,
    licenseNumber,
    gender,
    dateOfBirth,
    bloodType,
    address
  } = req.body;

  // ==========================================
  // VALIDATION
  // ==========================================

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  // Check if email is valid
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email');
  }

  // Check if password is strong enough
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // ==========================================
  // CREATE USER
  // ==========================================

  const userData = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: 'Staff', // ⚠️ IMPORTANT: Default role is always 'Staff'
    phone: phone?.trim(),
    gender,
    dateOfBirth,
    bloodType,
    address,
    isActive: true
  };

  // Add optional fields if provided
  if (specialization && specialization.trim()) {
    userData.specialization = specialization.trim();
  }

  if (department && department.trim()) {
    userData.department = department.trim();
  }

  if (licenseNumber && licenseNumber.trim()) {
    userData.licenseNumber = licenseNumber.trim();
  }

  try {
    // Create user - password will be hashed by pre-save hook
    const user = new User(userData);
    await user.save();

    // Log the action
    console.log(`✅ User created: ${user.email} (ID: ${user._id})`);
    if (specialization) {
      console.log(`   → Display as: Doctor (specialization: ${specialization})`);
    } else {
      console.log(`   → Display as: Staff`);
    }

    // Return user without password
    const userResponse = user.toPublicJSON();

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User created successfully',
      error: null
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to create user: ${error.message}`);
  }
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 * 
 * Query Parameters:
 * - role: filter by role (Staff, Patient, Admin)
 * - specialization: filter by specialization (Doctor, Nurse, etc.)
 * - page: pagination page number
 * - limit: items per page
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, specialization, page = 1, limit = 10 } = req.query;

  let filter = {};

  // Add role filter
  if (role) {
    filter.role = role;
  }

  // Add specialization filter (to find doctors)
  if (specialization) {
    filter.specialization = new RegExp(specialization, 'i');
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    const response = {
      users: users.map(user => ({
        ...user.toObject(),
        // Add frontend display role based on specialization
        displayRole: user.specialization ? 'Doctor' : user.role
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'Users retrieved successfully',
      error: null
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to retrieve users: ${error.message}`);
  }
});

/**
 * @desc    Update user details (Admin only)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Fields that can be updated
  const allowedFields = [
    'name',
    'phone',
    'specialization',
    'department',
    'licenseNumber',
    'gender',
    'dateOfBirth',
    'bloodType',
    'address',
    'isActive'
  ];

  // Filter to only allowed fields
  const fieldsToUpdate = {};
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      fieldsToUpdate[field] = updateData[field];
    }
  });

  try {
    const user = await User.findByIdAndUpdate(
      id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    console.log(`✅ User updated: ${user.email}`);

    const userResponse = {
      ...user.toObject(),
      displayRole: user.specialization ? 'Doctor' : user.role
    };

    res.status(200).json({
      success: true,
      data: userResponse,
      message: 'User updated successfully',
      error: null
    });
  } catch (error) {
    if (error.message === 'User not found') {
      res.status(404);
    } else {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    console.log(`✅ User deleted: ${user.email}`);

    res.status(200).json({
      success: true,
      data: { id },
      message: 'User deleted successfully',
      error: null
    });
  } catch (error) {
    if (error.message === 'User not found') {
      res.status(404);
    } else {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Deactivate/Activate user (Admin only)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private/Admin
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    res.status(400);
    throw new Error('isActive must be a boolean');
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const status = isActive ? 'activated' : 'deactivated';
    console.log(`✅ User ${status}: ${user.email}`);

    const userResponse = {
      ...user.toObject(),
      displayRole: user.specialization ? 'Doctor' : user.role
    };

    res.status(200).json({
      success: true,
      data: userResponse,
      message: `User ${status} successfully`,
      error: null
    });
  } catch (error) {
    if (error.message === 'User not found') {
      res.status(404);
    } else {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Get user statistics (Admin Dashboard)
 * @route   GET /api/admin/users/stats/overview
 * @access  Private/Admin
 */
export const getUserStats = asyncHandler(async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const staffUsers = await User.countDocuments({ role: 'Staff' });
    const patientUsers = await User.countDocuments({ role: 'Patient' });
    const adminUsers = await User.countDocuments({ role: 'Admin' });
    const doctors = await User.countDocuments({
      role: 'Staff',
      specialization: { $exists: true, $ne: null }
    });
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    const stats = {
      totalUsers,
      byRole: {
        staff: staffUsers,
        patient: patientUsers,
        admin: adminUsers,
        doctors // Staff with specialization
      },
      activeUsers,
      inactiveUsers
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: 'User statistics retrieved',
      error: null
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to retrieve statistics: ${error.message}`);
  }
});

export default {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
};
