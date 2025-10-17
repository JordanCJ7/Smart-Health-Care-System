import { apiFetch } from './api';

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userRole: 'Patient' | 'Staff' | 'Admin';
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  digitalHealthCardId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roleData: any; // Role-specific data
  bloodType?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  insurance?: {
    provider?: string;
    policyNumber?: string;
    groupNumber?: string;
  };
  specialization?: string;
  department?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
  error: null | string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  address?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  insurance?: {
    provider?: string;
    policyNumber?: string;
    groupNumber?: string;
  };
  specialization?: string;
  department?: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Fetch the authenticated user's profile with role-specific data
 * @returns Promise with user profile data
 */
export const getProfile = async (): Promise<ProfileResponse> => {
  return apiFetch('/v1/profile', {
    method: 'GET',
  });
};

/**
 * Update user profile
 * @param profileData - Profile data to update
 * @returns Promise with updated profile
 */
export const updateProfile = async (profileData: UpdateProfileData): Promise<ProfileResponse> => {
  return apiFetch('/v1/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

/**
 * Update user password
 * @param passwordData - Current and new password
 * @returns Promise with success message
 */
export const updatePassword = async (passwordData: PasswordUpdateData) => {
  return apiFetch('/v1/profile/password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  });
};
