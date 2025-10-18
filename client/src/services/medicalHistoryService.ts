import { apiFetch } from './api';

export interface MedicalHistoryData {
  patient: {
    _id: string;
    name: string;
    email: string;
    dateOfBirth?: string;
    bloodType?: string;
    gender?: string;
    phone?: string;
    address?: string;
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
  };
  appointments: Array<{
    _id: string;
    doctorId: { _id: string; name: string };
    date: string;
    time: string;
    status: string;
    reason?: string;
    department?: string;
    createdAt: string;
  }>;
  labOrders: Array<{
    _id: string;
    doctorId: { _id: string; name: string };
    testType: string;
    status: string;
    results?: any;
    priority?: string;
    createdAt: string;
    orderedAt: string;
  }>;
  prescriptions: Array<{
    _id: string;
    doctorId: { _id: string; name: string };
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration?: string;
    }>;
    status: string;
    createdAt: string;
    refillsRemaining?: number;
  }>;
  triageRecords: Array<{
    _id: string;
    vitals: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      oxygenSaturation?: number;
    };
    symptoms?: string;
    severityLevel: string;
    admissionStatus?: string;
    createdAt: string;
  }>;
}

/**
 * Get comprehensive medical history for a patient
 * @param patientId - Patient's user ID
 * @returns Promise with medical history data
 */
export const getPatientMedicalHistory = async (patientId: string) => {
  return apiFetch(`/triage/patient-history/${patientId}`, {
    method: 'GET',
  });
};

/**
 * Search for patients by name or email (for staff)
 * @param query - Search query string
 * @returns Promise with list of matching patients
 */
export const searchPatients = async (query: string) => {
  const params = new URLSearchParams({ search: query });
  return apiFetch(`/prescriptions/search/patients?${params.toString()}`, {
    method: 'GET',
  });
};

/**
 * Get patient profile by ID (for staff)
 * @param patientId - Patient's user ID
 * @returns Promise with patient profile data
 */
export const getPatientProfile = async (patientId: string) => {
  return apiFetch(`/admin/users/${patientId}`, {
    method: 'GET',
  });
};
