import mongoose from 'mongoose';

const triageRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    vitals: {
      bp: {
        type: String,
        required: [true, 'Blood pressure is required'],
      },
      hr: {
        type: Number,
        required: [true, 'Heart rate is required'],
      },
      temp: {
        type: Number,
        required: [true, 'Temperature is required'],
      },
      respiratoryRate: Number,
      oxygenSaturation: Number,
    },
    symptoms: {
      type: String,
      required: [true, 'Symptoms are required'],
    },
    severityLevel: {
      type: String,
      required: [true, 'Severity level is required'],
      enum: ['Critical', 'Urgent', 'Stable', 'Normal'],
    },
    admissionStatus: {
      type: String,
      enum: ['Queued', 'Admitted-ER', 'Admitted-Ward', 'Discharged'],
      default: 'Queued',
    },
    assignedBed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by (nurse) is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
triageRecordSchema.index({ patientId: 1, createdAt: -1 });
triageRecordSchema.index({ severityLevel: 1, admissionStatus: 1 });

const TriageRecord = mongoose.model('TriageRecord', triageRecordSchema);

export default TriageRecord;
