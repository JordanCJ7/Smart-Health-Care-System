import express from 'express';
import {
  getAllInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  restockInventory,
  checkDrugAvailability,
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Check drug availability by name
router.get('/check/:drugName', authorize('Staff', 'Admin'), checkDrugAvailability);

// Get all inventory items
router.get('/', authorize('Staff', 'Admin'), getAllInventory);

// Create inventory item
router.post('/', authorize('Staff', 'Admin'), createInventoryItem);

// Restock inventory item
router.post('/:id/restock', authorize('Staff', 'Admin'), restockInventory);

// Get, update, delete specific inventory item
router
  .route('/:id')
  .get(authorize('Staff', 'Admin'), getInventoryById)
  .put(authorize('Staff', 'Admin'), updateInventoryItem)
  .delete(authorize('Admin'), deleteInventoryItem);

export default router;
