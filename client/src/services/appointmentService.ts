import { apiFetch } from './api';

export interface CreateAppointmentData {
  doctorId: string;
  patientId?: string;
  date: string;
  time: string;
  department?: string;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  status?: string;
  date?: string;
  time?: string;
  notes?: string;
  reason?: string;
}

// Create appointment
export const createAppointment = async (appointmentData: CreateAppointmentData) => {
  return apiFetch('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
};

// Get user's appointments
export const getMyAppointments = async () => {
  return apiFetch('/appointments/me', {
    method: 'GET',
  });
};

// Get all appointments (Admin/Staff)
export const getAllAppointments = async (filters?: {
  status?: string;
  date?: string;
  doctorId?: string;
  patientId?: string;
}) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/appointments/all?${queryParams}` : '/appointments/all';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Get appointment by ID
export const getAppointmentById = async (id: string) => {
  return apiFetch(`/appointments/${id}`, {
    method: 'GET',
  });
};

// Update appointment
export const updateAppointment = async (id: string, updateData: UpdateAppointmentData) => {
  return apiFetch(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

// Delete appointment
export const deleteAppointment = async (id: string) => {
  return apiFetch(`/appointments/${id}`, {
    method: 'DELETE',
  });
};
