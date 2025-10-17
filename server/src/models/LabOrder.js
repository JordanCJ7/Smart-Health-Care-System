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
      enum: ['Ordered', 'Sample-Collected', 'Processing', 'Completed', 'Cancelled', 'Sample-Rejected'],
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
    // Clinical notes from ordering doctor (Step 3)
    clinicalNotes: {
      type: String,
      trim: true,
    },
    // General notes (can be updated by lab staff)
    notes: {
      type: String,
      trim: true,
    },
    // Sample quality tracking (Step 7a - Extension)
    sampleQuality: {
      status: {
        type: String,
        enum: ['Good', 'Poor', 'Contaminated', 'Insufficient'],
        default: 'Good',
      },
      rejectionReason: {
        type: String,
        trim: true,
      },
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rejectedAt: {
        type: Date,
      },
    },
    // Critical value alert (Step 8a - Extension)
    criticalAlert: {
      isCritical: {
        type: Boolean,
        default: false,
      },
      flaggedAt: {
        type: Date,
      },
      acknowledgedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      acknowledgedAt: {
        type: Date,
      },
      alertMessage: {
        type: String,
        trim: true,
      },
    },
    // Doctor's interpretation and follow-up (Step 10)
    doctorInterpretation: {
      interpretation: {
        type: String,
        trim: true,
      },
      followUpActions: {
        type: String,
        trim: true,
      },
      interpretedAt: {
        type: Date,
      },
    },
    // Results notification tracking (Step 9)
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: {
      type: Date,
    },
    // Lab staff who completed the test (Step 8)
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
    // Sample collection tracking (Step 6)
    sampleCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sampleCollectedAt: {
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
