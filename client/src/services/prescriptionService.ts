import { apiFetch } from './api';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

export interface CreatePrescriptionData {
  patientId: string;
  medications: Medication[];
  refillsRemaining?: number;
  notes?: string;
}

export interface UpdatePrescriptionData {
  status: 'Pending' | 'Dispensed' | 'Rejected' | 'Expired';
  notes?: string;
}

// Create prescription (Doctor)
export const createPrescription = async (prescriptionData: CreatePrescriptionData) => {
  return apiFetch('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(prescriptionData),
  });
};

// Get pending prescriptions (Pharmacist)
export const getPendingPrescriptions = async () => {
  return apiFetch('/prescriptions/pending', {
    method: 'GET',
  });
};

// Get all prescriptions (Staff/Admin)
export const getAllPrescriptions = async (filters?: {
  status?: string;
  patientId?: string;
  doctorId?: string;
}) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/prescriptions/all?${queryParams}` : '/prescriptions/all';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Get prescription by ID
export const getPrescriptionById = async (id: string) => {
  return apiFetch(`/prescriptions/${id}`, {
    method: 'GET',
  });
};

// Update prescription status (Pharmacist)
export const updatePrescriptionStatus = async (id: string, updateData: UpdatePrescriptionData) => {
  return apiFetch(`/prescriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

// Get patient's prescriptions
export const getPatientPrescriptions = async (patientId: string) => {
  return apiFetch(`/prescriptions/patient/${patientId}`, {
    method: 'GET',
  });
};

// Get doctor's prescriptions
export const getDoctorPrescriptions = async () => {
  return apiFetch('/prescriptions/doctor/me', {
    method: 'GET',
  });
};
