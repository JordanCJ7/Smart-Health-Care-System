import { apiFetch } from './api';

/**
 * Get all patients (Staff-accessible)
 * @returns Promise with list of all patients
 */
export const getAllPatients = async () => {
  return apiFetch('/users/patients', {
    method: 'GET',
  });
};

/**
 * Get all staff members (Staff-accessible)
 * @returns Promise with list of all staff
 */
export const getAllStaff = async () => {
  return apiFetch('/users/staff', {
    method: 'GET',
  });
};
