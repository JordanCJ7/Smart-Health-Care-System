import mongoose from 'mongoose';

const labOrderSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    testType: {
      type: String,
      required: [true, 'Test type is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Ordered', 'Sample-Collected', 'Processing', 'Completed', 'Cancelled'],
      default: 'Ordered',
    },
    priority: {
      type: String,
      enum: ['Routine', 'Urgent', 'STAT'],
      default: 'Routine',
    },
    results: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    notes: {
      type: String,
      trim: true,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
labOrderSchema.index({ patientId: 1, createdAt: -1 });
labOrderSchema.index({ doctorId: 1, createdAt: -1 });
labOrderSchema.index({ status: 1, priority: 1 });

const LabOrder = mongoose.model('LabOrder', labOrderSchema);

export default LabOrder;
