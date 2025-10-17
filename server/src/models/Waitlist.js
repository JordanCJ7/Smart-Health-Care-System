import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
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
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required'],
    },
    alternativeDates: [
      {
        type: Date,
      },
    ],
    department: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Fulfilled', 'Cancelled', 'Expired'],
      default: 'Active',
    },
    priority: {
      type: Number,
      default: 0,
    },
    notificationsSent: {
      type: Number,
      default: 0,
    },
    fulfilledAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
waitlistSchema.index({ patientId: 1, status: 1 });
waitlistSchema.index({ doctorId: 1, preferredDate: 1, status: 1 });
waitlistSchema.index({ status: 1, createdAt: 1 });
waitlistSchema.index({ expiresAt: 1 });

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
