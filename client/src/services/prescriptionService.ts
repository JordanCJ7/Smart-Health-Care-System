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
  return apiFetch('/prescriptions/staff/me', {
    method: 'GET',
  });
};

// UC-001 Extension scenarios

// Check inventory availability (UC-001 Step 4)
export const checkInventoryAvailability = async (prescriptionId: string) => {
  return apiFetch(`/prescriptions/${prescriptionId}/check-inventory`, {
    method: 'POST',
  });
};

// Request clarification from doctor (UC-001 Extension 3a)
export const requestClarification = async (prescriptionId: string, reason: string) => {
  return apiFetch(`/prescriptions/${prescriptionId}/clarify`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

// Suggest alternative medication (UC-001 Extension 4a)
export const suggestAlternative = async (
  prescriptionId: string,
  alternativeMedication: { name: string; dosage: string; frequency: string; reason: string }
) => {
  return apiFetch(`/prescriptions/${prescriptionId}/suggest-alternative`, {
    method: 'POST',
    body: JSON.stringify(alternativeMedication),
  });
};

// Dispense prescription (UC-001 Steps 5-8)
export const dispensePrescription = async (
  prescriptionId: string,
  dispensedQuantities?: Record<string, number>
) => {
  return apiFetch(`/prescriptions/${prescriptionId}/dispense`, {
    method: 'POST',
    body: JSON.stringify({ dispensedQuantities }),
  });
};
