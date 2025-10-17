import express from 'express';
import {
  createOrUpdateSchedule,
  getAvailableSlots,
  getDoctorSchedule,
  holdSlot,
  releaseSlot,
  blockSlots,
  getAllSchedules,
  deleteSchedule,
} from '../controllers/scheduleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route to get available slots (UC-002 Step 3)
router.get('/available', getAvailableSlots);

// All other routes require authentication
router.use(protect);

// Hold and release slots
router.post('/hold', holdSlot);
router.post('/release', releaseSlot);

// Get doctor's schedule
router.get('/doctor/:doctorId', getDoctorSchedule);

// Staff/Admin only routes
router.post('/', authorize('Staff', 'Admin'), createOrUpdateSchedule);
router.get('/', authorize('Staff', 'Admin'), getAllSchedules);

// Schedule management
router
  .route('/:id')
  .put(authorize('Staff', 'Admin'), blockSlots)
  .delete(authorize('Admin'), deleteSchedule);

export default router;
