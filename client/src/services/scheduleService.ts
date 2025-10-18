import { apiFetch } from './api';

export interface ScheduleData {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDuration?: number;
  maxPatientsPerSlot?: number;
  blockedSlots?: string[];
}

export interface SlotHoldData {
  scheduleId: string;
  time: string;
  holdDurationMinutes?: number;
}

export interface AvailableSlotFilters {
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  department?: string;
  specialization?: string;
}

// Get available slots (UC-002 Step 3) - Public route
export const getAvailableSlots = async (filters?: AvailableSlotFilters) => {
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

// Get doctor's schedule
export const getDoctorSchedule = async (doctorId: string, filters?: { startDate?: string; endDate?: string }) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/schedules/doctor/${doctorId}?${queryParams}` : `/schedules/doctor/${doctorId}`;
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Create or update schedule (Staff/Admin)
export const createOrUpdateSchedule = async (scheduleData: ScheduleData) => {
  return apiFetch('/schedules', {
    method: 'POST',
    body: JSON.stringify(scheduleData),
  });
};

// Get all schedules (Staff/Admin)
export const getAllSchedules = async (filters?: { doctorId?: string; date?: string }) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/schedules?${queryParams}` : '/schedules';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Block slots in schedule (Staff/Admin)
export const blockSlots = async (scheduleId: string, slots: string[]) => {
  return apiFetch(`/schedules/${scheduleId}`, {
    method: 'PUT',
    body: JSON.stringify({ blockedSlots: slots }),
  });
};

// Delete schedule (Admin)
export const deleteSchedule = async (scheduleId: string) => {
  return apiFetch(`/schedules/${scheduleId}`, {
    method: 'DELETE',
  });
};
