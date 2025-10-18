import { apiFetch } from './api';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'Patient' | 'Staff' | 'Admin';
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  specialization?: string;
  department?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  specialization?: string;
  department?: string;
  isActive?: boolean;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  department?: string;
  specialization?: string;
  search?: string;
}

// Get all users with filters
export const getAllUsers = async (filters?: UserFilters) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/admin/users?${queryParams}` : '/admin/users';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Create a new user
export const createUser = async (userData: CreateUserData) => {
  return apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Get user statistics
export const getUserStats = async () => {
  return apiFetch('/admin/users/stats/overview', {
    method: 'GET',
  });
};

// Update user details
export const updateUser = async (userId: string, userData: UpdateUserData) => {
  return apiFetch(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

// Delete user
export const deleteUser = async (userId: string) => {
  return apiFetch(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
};

// Toggle user active status
export const toggleUserStatus = async (userId: string) => {
  return apiFetch(`/admin/users/${userId}/status`, {
    method: 'PATCH',
  });
};
