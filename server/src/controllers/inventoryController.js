import asyncHandler from 'express-async-handler';
import Inventory from '../models/Inventory.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (Staff, Admin)
export const getAllInventory = asyncHandler(async (req, res) => {
  const { status, lowStock } = req.query;

  const query = {};
  if (status) query.status = status;
  if (lowStock === 'true') {
    query.quantity = { $lte: query.reorderLevel || 10 };
  }

  const inventory = await Inventory.find(query).sort('drugName');

  sendSuccess(res, inventory);
});

// @desc    Get inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private (Staff, Admin)
export const getInventoryById = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  sendSuccess(res, item);
});

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private (Admin, Staff)
export const createInventoryItem = asyncHandler(async (req, res) => {
  const {
    drugName,
    genericName,
    category,
    quantity,
    unit,
    reorderLevel,
    expiryDate,
    batchNumber,
    supplier,
    costPerUnit,
    alternatives,
  } = req.body;

  // Check if item already exists
  const existingItem = await Inventory.findOne({ drugName });
  if (existingItem) {
    res.status(400);
    throw new Error('Inventory item with this drug name already exists');
  }

  const item = await Inventory.create({
    drugName,
    genericName,
    category,
    quantity,
    unit,
    reorderLevel,
    expiryDate,
    batchNumber,
    supplier,
    costPerUnit,
    alternatives,
  });

  sendSuccess(res, item, 201);
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Admin, Staff)
export const updateInventoryItem = asyncHandler(async (req, res) => {
  let item = await Inventory.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  const updatedItem = await Inventory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  sendSuccess(res, updatedItem);
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin)
export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  await item.deleteOne();

  sendSuccess(res, { message: 'Inventory item deleted' });
});

// @desc    Restock inventory item
// @route   POST /api/inventory/:id/restock
// @access  Private (Admin, Staff)
export const restockInventory = asyncHandler(async (req, res) => {
  const { quantity, batchNumber, expiryDate } = req.body;

  if (!quantity || quantity <= 0) {
    res.status(400);
    throw new Error('Valid quantity is required');
  }

  const item = await Inventory.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  item.quantity += quantity;
  item.lastRestocked = new Date();
  if (batchNumber) item.batchNumber = batchNumber;
  if (expiryDate) item.expiryDate = expiryDate;

  await item.save();

  sendSuccess(res, item, 200, `Restocked ${quantity} units`);
});

// @desc    Check availability for specific drug
// @route   GET /api/inventory/check/:drugName
// @access  Private (Staff, Admin)
export const checkDrugAvailability = asyncHandler(async (req, res) => {
  const { drugName } = req.params;
  const { quantity } = req.query;

  const item = await Inventory.findOne({ drugName });

  if (!item) {
    return sendSuccess(res, {
      drugName,
      available: false,
      reason: 'Drug not in inventory',
      alternatives: [],
    });
  }

  const check = item.checkAvailability(parseInt(quantity) || 1);

  sendSuccess(res, {
    drugName,
    ...check,
    inventoryItem: item,
  });
});
