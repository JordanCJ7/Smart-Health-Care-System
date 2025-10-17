import { apiFetch } from './api';

export interface CreateLabOrderData {
  patientId: string;
  testType: string;
  priority?: 'Routine' | 'Urgent' | 'STAT';
  clinicalNotes?: string;
}

export interface UpdateLabResultsData {
  results: Record<string, any>;
  notes?: string;
  status?: string;
  criticalValues?: string[];
}

export interface DoctorInterpretationData {
  interpretation: string;
  followUpActions?: string;
}

export interface RejectSampleData {
  rejectionReason: string;
  qualityStatus?: 'Poor' | 'Contaminated' | 'Insufficient';
}

// UC-003 Step 1, 3, 4: Create lab order (Doctor/Staff)
export const createLabOrder = async (orderData: CreateLabOrderData) => {
  return apiFetch('/labs/order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

// UC-003 Step 5: Get pending lab orders (Lab Technician/Staff)
export const getPendingLabOrders = async (filters?: { status?: string; priority?: string }) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/labs/orders?${queryParams}` : '/labs/orders';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Get all lab orders (Staff/Admin)
export const getAllLabOrders = async (filters?: {
  status?: string;
  patientId?: string;
  doctorId?: string;
  priority?: string;
}) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/labs/all?${queryParams}` : '/labs/all';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Get lab order by ID
export const getLabOrderById = async (orderId: string) => {
  return apiFetch(`/labs/order/${orderId}`, {
    method: 'GET',
  });
};

// UC-003 Step 6: Collect sample
export const collectSample = async (orderId: string) => {
  return apiFetch(`/labs/collect-sample/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({}),
  });
};

// UC-003 Step 7a (Extension): Reject sample due to poor quality
export const rejectSample = async (orderId: string, rejectData: RejectSampleData) => {
  return apiFetch(`/labs/reject-sample/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(rejectData),
  });
};

// UC-003 Step 7, 8, 8a, 9: Update lab results (Lab Technician/Staff)
export const updateLabResults = async (orderId: string, resultsData: UpdateLabResultsData) => {
  return apiFetch(`/labs/results/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(resultsData),
  });
};

// UC-003 Step 10: Add doctor interpretation
export const addDoctorInterpretation = async (orderId: string, interpretationData: DoctorInterpretationData) => {
  return apiFetch(`/labs/interpretation/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(interpretationData),
  });
};

// UC-003 Step 8a (Extension): Acknowledge critical value alert
export const acknowledgeCriticalAlert = async (orderId: string) => {
  return apiFetch(`/labs/acknowledge-critical/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({}),
  });
};

// Update lab order status
export const updateLabOrderStatus = async (orderId: string, status: string) => {
  return apiFetch(`/labs/status/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// Get patient's lab results
export const getPatientLabResults = async (patientId: string) => {
  return apiFetch(`/labs/patient/${patientId}`, {
    method: 'GET',
  });
};
