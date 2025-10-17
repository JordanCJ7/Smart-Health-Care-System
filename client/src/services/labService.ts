import { apiFetch } from './api';

export interface CreateLabOrderData {
  patientId: string;
  testType: string;
  priority?: 'Routine' | 'Urgent' | 'STAT';
  notes?: string;
}

export interface UpdateLabResultsData {
  results: Record<string, any>;
  notes?: string;
  status?: string;
}

// Create lab order (Doctor)
export const createLabOrder = async (orderData: CreateLabOrderData) => {
  return apiFetch('/labs/order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

// Get pending lab orders (Lab Technician)
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

// Update lab results (Lab Technician)
export const updateLabResults = async (orderId: string, resultsData: UpdateLabResultsData) => {
  return apiFetch(`/labs/results/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(resultsData),
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
