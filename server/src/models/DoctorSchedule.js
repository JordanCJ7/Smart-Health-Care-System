import mongoose from 'mongoose';

const scheduleSlotSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Held', 'Blocked'],
    default: 'Available',
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  heldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  heldUntil: {
    type: Date,
  },
});

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    location: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    slots: [scheduleSlotSchema],
    isActive: {
      type: Boolean,
      default: true,
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

// Compound index to prevent duplicate schedules for same doctor and date
doctorScheduleSchema.index({ doctorId: 1, date: 1 }, { unique: true });
doctorScheduleSchema.index({ date: 1, 'slots.status': 1 });

// Method to hold a slot temporarily
doctorScheduleSchema.methods.holdSlot = function (time, userId, holdDurationMinutes = 10) {
  const slot = this.slots.find((s) => s.time === time && s.status === 'Available');
  if (!slot) {
    throw new Error('Slot not available');
  }
  
  slot.status = 'Held';
  slot.heldBy = userId;
  slot.heldUntil = new Date(Date.now() + holdDurationMinutes * 60 * 1000);
  
  return this.save();
};

// Method to release a held slot
doctorScheduleSchema.methods.releaseSlot = function (time) {
  const slot = this.slots.find((s) => s.time === time);
  if (slot && slot.status === 'Held') {
    slot.status = 'Available';
    slot.heldBy = undefined;
    slot.heldUntil = undefined;
  }
  return this.save();
};

// Method to book a slot
doctorScheduleSchema.methods.bookSlot = function (time, appointmentId) {
  const slot = this.slots.find((s) => s.time === time && ['Available', 'Held'].includes(s.status));
  if (!slot) {
    throw new Error('Slot not available for booking');
  }
  
  slot.status = 'Booked';
  slot.appointmentId = appointmentId;
  slot.heldBy = undefined;
  slot.heldUntil = undefined;
  
  return this.save();
};

// Static method to release expired holds
doctorScheduleSchema.statics.releaseExpiredHolds = async function () {
  const schedules = await this.find({
    'slots.status': 'Held',
    'slots.heldUntil': { $lt: new Date() },
  });
  
  for (const schedule of schedules) {
    schedule.slots.forEach((slot) => {
      if (slot.status === 'Held' && slot.heldUntil < new Date()) {
        slot.status = 'Available';
        slot.heldBy = undefined;
        slot.heldUntil = undefined;
      }
    });
    await schedule.save();
  }
  
  return schedules.length;
};

const DoctorSchedule = mongoose.model('DoctorSchedule', doctorScheduleSchema);

export default DoctorSchedule;
