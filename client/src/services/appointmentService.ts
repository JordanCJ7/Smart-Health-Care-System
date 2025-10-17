import { apiFetch } from './api';

export interface CreateAppointmentData {
  doctorId: string;
  patientId?: string;
  date: string;
  time: string;
  department?: string;
  reason?: string;
  notes?: string;
  scheduleId?: string;
  paymentId?: string;
}

export interface UpdateAppointmentData {
  status?: string;
  date?: string;
  time?: string;
  notes?: string;
  reason?: string;
}

export interface SlotHoldData {
  scheduleId: string;
  time: string;
  holdDurationMinutes?: number;
}

export interface WaitlistData {
  doctorId: string;
  preferredDate: string;
  alternativeDates?: string[];
  department?: string;
  reason?: string;
}

// Get available slots (UC-002 Step 3)
export const getAvailableSlots = async (filters?: {
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  department?: string;
  specialization?: string;
}) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/schedules/available?${queryParams}` : '/schedules/available';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Hold a slot temporarily (UC-002 Step 4)
export const holdSlot = async (holdData: SlotHoldData) => {
  return apiFetch('/schedules/hold', {
    method: 'POST',
    body: JSON.stringify(holdData),
  });
};

// Release a held slot
export const releaseSlot = async (scheduleId: string, time: string) => {
  return apiFetch('/schedules/release', {
    method: 'POST',
    body: JSON.stringify({ scheduleId, time }),
  });
};

// Create appointment (UC-002 Step 6)
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

// Waitlist operations (UC-002 Extension 3a)
export const addToWaitlist = async (waitlistData: WaitlistData) => {
  return apiFetch('/waitlist', {
    method: 'POST',
    body: JSON.stringify(waitlistData),
  });
};

export const getMyWaitlist = async () => {
  return apiFetch('/waitlist/me', {
    method: 'GET',
  });
};

export const cancelWaitlistEntry = async (id: string) => {
  return apiFetch(`/waitlist/${id}`, {
    method: 'DELETE',
  });
};
