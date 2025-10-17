import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Get authenticated user's profile with role-specific data
// @route   GET /api/v1/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  // Fetch the authenticated user (already attached by protect middleware)
  const userId = req.user._id;
  const userRole = req.user.role;

  // Fetch core user data (excluding password)
  const user = await User.findById(userId).select('-password').lean();

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prepare base profile data
  const profileData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    userRole: user.role,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
    digitalHealthCardId: user.digitalHealthCardId,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  // Add role-specific data based on user role
  let roleSpecificData = {};

  switch (userRole) {
    case 'Patient':
      roleSpecificData = await getPatientSpecificData(userId, user);
      break;

    case 'Staff':
      roleSpecificData = await getStaffSpecificData(userId, user);
      break;

    case 'Admin':
      roleSpecificData = await getAdminSpecificData(userId, user);
      break;

    default:
      // Generic role - no additional data
      roleSpecificData = {};
  }

  // Merge base profile with role-specific data
  const completeProfile = {
    ...profileData,
    roleData: roleSpecificData,
  };

  sendSuccess(res, completeProfile);
});

// Helper function: Get Patient-specific data
const getPatientSpecificData = async (userId, user) => {
  // Fetch recent appointments
  const recentAppointments = await Appointment.find({ patientId: userId })
    .sort({ date: -1 })
    .limit(5)
    .populate('doctorId', 'name specialization')
    .lean();

  // Get last visit date
  const completedAppointments = await Appointment.find({
    patientId: userId,
    status: 'Completed',
  })
    .sort({ date: -1 })
    .limit(1)
    .lean();

  const lastVisitDate = completedAppointments.length > 0 ? completedAppointments[0].date : null;

  // Count upcoming appointments
  const upcomingAppointmentsCount = await Appointment.countDocuments({
    patientId: userId,
    status: 'Scheduled',
    date: { $gte: new Date() },
  });

  return {
    bloodGroup: user.bloodType,
    lastVisitDate,
    upcomingAppointmentsCount,
    recentAppointments: recentAppointments.map((apt) => ({
      id: apt._id,
      doctorName: apt.doctorId?.name || 'Unknown',
      specialization: apt.doctorId?.specialization || 'N/A',
      date: apt.date,
      time: apt.time,
      status: apt.status,
    })),
    insurance: {
      provider: user.insurance?.provider || null,
      policyNumber: user.insurance?.policyNumber || null,
      groupNumber: user.insurance?.groupNumber || null,
    },
    emergencyContact: {
      name: user.emergencyContact?.name || null,
      relationship: user.emergencyContact?.relationship || null,
      phone: user.emergencyContact?.phone || null,
    },
  };
};

// Helper function: Get Staff-specific data
const getStaffSpecificData = async (userId, user) => {
  // Count appointments managed/created by staff
  const appointmentsManaged = await Appointment.countDocuments({
    createdBy: userId,
  });

  return {
    department: user.department || 'General',
    specialization: user.specialization || 'N/A',
    internalId: user.digitalHealthCardId || 'N/A',
    appointmentsManaged,
    permissions: ['Manage Appointments', 'View Reports', 'Schedule Management'],
    systemTools: [
      { name: 'Appointment System', url: '/appointments' },
      { name: 'Patient Records', url: '/patients' },
      { name: 'Bed Management', url: '/beds' },
    ],
  };
};

// Helper function: Get Admin-specific data
const getAdminSpecificData = async (userId, user) => {
  // Count total users
  const totalUsers = await User.countDocuments({ isActive: true });
  const totalPatients = await User.countDocuments({ role: 'Patient', isActive: true });
  const totalStaff = await User.countDocuments({ role: 'Staff', isActive: true });
  const totalAdmins = await User.countDocuments({ role: 'Admin', isActive: true });

  // Count today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = await Appointment.countDocuments({
    date: { $gte: today, $lt: tomorrow },
  });

  return {
    department: user.department || 'Administration',
    adminLevel: 'System Administrator',
    permissions: ['Full System Access', 'User Management', 'System Configuration', 'Reports & Analytics'],
    systemStats: {
      totalUsers,
      totalPatients,
      totalStaff,
      totalAdmins,
      todayAppointments,
    },
    adminTools: [
      { name: 'User Management', url: '/admin/users' },
      { name: 'System Analytics', url: '/admin/analytics' },
      { name: 'Department Schedule', url: '/admin/schedule' },
      { name: 'Data Sync', url: '/admin/sync' },
      { name: 'Notifications', url: '/admin/notifications' },
    ],
  };
};

// @desc    Update authenticated user's profile
// @route   PUT /api/v1/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fields that can be updated
  const allowedUpdates = [
    'name',
    'phone',
    'dateOfBirth',
    'gender',
    'bloodType',
    'address',
    'emergencyContact',
    'insurance',
    'specialization',
    'department',
  ];

  // Build update object with only allowed fields
  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  });

  // Validate that there are fields to update
  if (Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error('No valid fields provided for update');
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found');
  }

  sendSuccess(res, {
    message: 'Profile updated successfully',
    user: updatedUser,
  });
});

// @desc    Update password
// @route   PUT /api/v1/profile/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  // Validate inputs
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide both current and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  // Get user with password
  const user = await User.findById(userId).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordCorrect = await user.matchPassword(currentPassword);

  if (!isPasswordCorrect) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccess(res, {
    message: 'Password updated successfully',
  });
});
