import { apiFetch } from './api';

export interface CreateTriageData {
  patientId: string;
  vitals: {
    bp: string;
    hr: number;
    temp: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  symptoms: string;
  severityLevel: 'Critical' | 'Urgent' | 'Stable' | 'Normal';
  notes?: string;
}

export interface UpdateTriageData {
  vitals?: {
    bp?: string;
    hr?: number;
    temp?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  symptoms?: string;
  severityLevel?: string;
  admissionStatus?: string;
  assignedBed?: string;
  notes?: string;
}

export interface CreateBedData {
  bedNumber: string;
  ward: string;
  notes?: string;
}

export interface AssignBedData {
  bedId: string;
  patientId: string;
}

// Triage APIs

// Create triage record
export const createTriageRecord = async (triageData: CreateTriageData) => {
  return apiFetch('/triage', {
    method: 'POST',
    body: JSON.stringify(triageData),
  });
};

// Get all triage records
export const getTriageRecords = async (filters?: {
  status?: string;
  severityLevel?: string;
  patientId?: string;
}) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/triage?${queryParams}` : '/triage';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Get triage record by ID
export const getTriageRecordById = async (id: string) => {
  return apiFetch(`/triage/${id}`, {
    method: 'GET',
  });
};

// Update triage record
export const updateTriageRecord = async (id: string, updateData: UpdateTriageData) => {
  return apiFetch(`/triage/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

// Bed Management APIs

// Get all beds
export const getAllBeds = async (filters?: { status?: string; ward?: string }) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/beds?${queryParams}` : '/beds';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Get bed by ID
export const getBedById = async (id: string) => {
  return apiFetch(`/beds/${id}`, {
    method: 'GET',
  });
};

// Create bed
export const createBed = async (bedData: CreateBedData) => {
  return apiFetch('/beds', {
    method: 'POST',
    body: JSON.stringify(bedData),
  });
};

// Assign bed to patient
export const assignBed = async (assignData: AssignBedData) => {
  return apiFetch('/beds/assign', {
    method: 'PUT',
    body: JSON.stringify(assignData),
  });
};

// Release bed
export const releaseBed = async (bedId: string) => {
  return apiFetch(`/beds/release/${bedId}`, {
    method: 'PUT',
    body: JSON.stringify({}),
  });
};

// Update bed
export const updateBed = async (bedId: string, updateData: Partial<CreateBedData>) => {
  return apiFetch(`/beds/${bedId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

// UC-004 Step 2: Verify Patient Identity
export const verifyPatientIdentity = async (identificationData: {
  digitalHealthCardId?: string;
  name?: string;
  dateOfBirth?: string;
}) => {
  return apiFetch('/triage/verify-patient', {
    method: 'POST',
    body: JSON.stringify(identificationData),
  });
};

// UC-004 Step 3: Access/Manage Patient Medical History
export const getPatientMedicalHistory = async (patientId: string) => {
  return apiFetch(`/triage/patient-history/${patientId}`, {
    method: 'GET',
  });
};
