import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userRole: {
      type: String,
      enum: ['Patient', 'Staff', 'Admin'],
      required: [true, 'User role is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'CREATE_TRIAGE',
        'UPDATE_TRIAGE',
        'ASSIGN_BED',
        'RELEASE_BED',
        'VIEW_PATIENT_HISTORY',
        'UPDATE_PATIENT_HISTORY',
        'NOTIFY_DOCTOR',
        'LOGIN',
        'LOGOUT',
        'CREATE_APPOINTMENT',
        'UPDATE_APPOINTMENT',
        'CREATE_LAB_ORDER',
        'CREATE_PRESCRIPTION',
        'OTHER'
      ],
    },
    resource: {
      type: String,
      enum: ['Triage', 'Bed', 'Patient', 'Appointment', 'LabOrder', 'Prescription', 'User', 'System'],
      required: [true, 'Resource type is required'],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'resource',
    },
    details: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Success', 'Failure', 'Partial'],
      default: 'Success',
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
