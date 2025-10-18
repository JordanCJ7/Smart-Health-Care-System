/**
 * Admin User Management Routes
 * 
 * Routes for admin-only user management operations
 * All routes require authentication and Admin role
 */

import express from 'express';
import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
} from '../controllers/adminUserController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes - require authentication and Admin role
router.use(protect);
router.use(authorize('Admin'));

/**
 * User Management Endpoints
 */

// GET /api/admin/users - Get all users with filters
router.get('/', getAllUsers);

// POST /api/admin/users - Create a new user
router.post('/', createUser);

// GET /api/admin/users/stats/overview - Get user statistics
router.get('/stats/overview', getUserStats);

// PUT /api/admin/users/:id - Update user details
router.put('/:id', updateUser);

// DELETE /api/admin/users/:id - Delete user
router.delete('/:id', deleteUser);

// PATCH /api/admin/users/:id/status - Toggle user active status
router.patch('/:id/status', toggleUserStatus);

export default router;
