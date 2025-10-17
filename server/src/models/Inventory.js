import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    drugName: {
      type: String,
      required: [true, 'Drug name is required'],
      trim: true,
      unique: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      default: 'units',
      trim: true,
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      default: 10,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    supplier: {
      type: String,
      trim: true,
    },
    costPerUnit: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
    },
    alternatives: [
      {
        drugName: String,
        genericName: String,
      }
    ],
    status: {
      type: String,
      enum: ['Available', 'Low Stock', 'Out of Stock', 'Expired'],
      default: 'Available',
    },
    lastRestocked: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
inventorySchema.index({ drugName: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ expiryDate: 1 });

// Virtual for checking if expired
inventorySchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

// Pre-save middleware to update status based on quantity and expiry
inventorySchema.pre('save', function(next) {
  if (this.expiryDate < new Date()) {
    this.status = 'Expired';
  } else if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.reorderLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'Available';
  }
  next();
});

// Method to check availability for a specific quantity
inventorySchema.methods.checkAvailability = function(requiredQuantity) {
  if (this.isExpired) {
    return { available: false, reason: 'Drug expired', alternatives: this.alternatives };
  }
  if (this.quantity < requiredQuantity) {
    return { 
      available: false, 
      reason: 'Insufficient stock', 
      availableQuantity: this.quantity,
      alternatives: this.alternatives 
    };
  }
  return { available: true, availableQuantity: this.quantity };
};

// Method to reduce inventory after dispensing
inventorySchema.methods.dispense = async function(quantity) {
  if (this.quantity < quantity) {
    throw new Error('Insufficient inventory');
  }
  this.quantity -= quantity;
  await this.save();
  return this;
};

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
