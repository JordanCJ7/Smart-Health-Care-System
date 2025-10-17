import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient ID is required'],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'PRESCRIPTION_UNCLEAR',
        'DRUG_UNAVAILABLE',
        'PARTIAL_DISPENSE',
        'PAYMENT_FAILED',
        'PRESCRIPTION_DISPENSED',
        'INVENTORY_LOW',
        'GENERAL'
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    relatedPrescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EPrescription',
    },
    relatedPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['Unread', 'Read', 'Archived'],
      default: 'Unread',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.status = 'Read';
  this.readAt = new Date();
  await this.save();
  return this;
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
