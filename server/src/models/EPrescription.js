import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true,
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    trim: true,
  },
  duration: {
    type: String,
    trim: true,
  },
  instructions: {
    type: String,
    trim: true,
  },
});

const ePrescriptionSchema = new mongoose.Schema(
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
    medications: {
      type: [medicationSchema],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one medication is required',
      },
    },
    status: {
      type: String,
      enum: ['Pending', 'Dispensed', 'Rejected', 'Expired', 'Clarification_Required', 'Partially_Dispensed'],
      default: 'Pending',
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    validatedAt: {
      type: Date,
    },
    refillsRemaining: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    clarificationRequest: {
      reason: String,
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      requestedAt: Date,
      resolved: {
        type: Boolean,
        default: false,
      },
      response: String,
    },
    unavailableMedications: [
      {
        medicationName: String,
        reason: String,
        alternatives: [String],
        suggestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      }
    ],
    dispensedMedications: [
      {
        medicationName: String,
        quantity: Number,
        dispensedAt: Date,
      }
    ],
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ePrescriptionSchema.index({ patientId: 1, createdAt: -1 });
ePrescriptionSchema.index({ doctorId: 1, createdAt: -1 });
ePrescriptionSchema.index({ status: 1 });

// Set expiration date before saving
ePrescriptionSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Default expiration: 90 days from creation
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }
  next();
});

const EPrescription = mongoose.model('EPrescription', ePrescriptionSchema);

export default EPrescription;
