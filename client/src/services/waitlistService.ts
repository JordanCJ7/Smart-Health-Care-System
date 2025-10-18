import { apiFetch } from './api';

export interface WaitlistData {
  doctorId: string;
  preferredDate: string;
  alternativeDates?: string[];
  department?: string;
  reason?: string;
  priority?: 'Normal' | 'Urgent';
}

export interface WaitlistEntry {
  _id: string;
  patientId: string;
  doctorId: string;
  preferredDate: string;
  alternativeDates?: string[];
  department?: string;
  reason?: string;
  priority: string;
  status: 'Waiting' | 'Notified' | 'Fulfilled' | 'Cancelled' | 'Expired';
  notifiedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Add patient to waitlist
export const addToWaitlist = async (waitlistData: WaitlistData) => {
  return apiFetch('/waitlist', {
    method: 'POST',
    body: JSON.stringify(waitlistData),
  });
};

// Get current user's waitlist entries
export const getMyWaitlist = async (filters?: { status?: string }) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/waitlist/me?${queryParams}` : '/waitlist/me';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Get waitlist for a specific doctor (Staff/Admin)
export const getDoctorWaitlist = async (doctorId: string, filters?: { status?: string }) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/waitlist/doctor/${doctorId}?${queryParams}` : `/waitlist/doctor/${doctorId}`;
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Notify waitlist patient of available slot (Staff/Admin)
export const notifyWaitlistPatient = async (waitlistId: string, availableSlot?: { date: string; time: string }) => {
  return apiFetch(`/waitlist/notify/${waitlistId}`, {
    method: 'POST',
    body: JSON.stringify(availableSlot || {}),
  });
};

// Fulfill waitlist entry (Staff/Admin) - mark as fulfilled when appointment is booked
export const fulfillWaitlistEntry = async (waitlistId: string, appointmentId: string) => {
  return apiFetch(`/waitlist/${waitlistId}/fulfill`, {
    method: 'PUT',
    body: JSON.stringify({ appointmentId }),
  });
};

// Cancel waitlist entry
export const cancelWaitlistEntry = async (waitlistId: string) => {
  return apiFetch(`/waitlist/${waitlistId}`, {
    method: 'DELETE',
  });
};
