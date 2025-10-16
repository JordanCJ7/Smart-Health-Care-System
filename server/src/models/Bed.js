import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      required: [true, 'Bed number is required'],
      unique: true,
      trim: true,
    },
    ward: {
      type: String,
      required: [true, 'Ward is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Vacant', 'Occupied', 'Reserved', 'Maintenance'],
      default: 'Vacant',
    },
    currentPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bedSchema.index({ ward: 1, status: 1 });
bedSchema.index({ bedNumber: 1 });

const Bed = mongoose.model('Bed', bedSchema);

export default Bed;
