import { apiFetch } from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  specialization?: string;
  department?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      phone?: string;
      specialization?: string;
      department?: string;
    };
  };
  error: null;
}

// Register user
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Login user
export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// Get current user profile
export const getProfile = async () => {
  return apiFetch('/auth/me', {
    method: 'GET',
  });
};

// Update user profile
export const updateProfile = async (profileData: Partial<RegisterData>) => {
  return apiFetch('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

// Update password
export const updatePassword = async (currentPassword: string, newPassword: string) => {
  return apiFetch('/auth/updatepassword', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

// Logout (client-side only - clear token)
export const logout = () => {
  localStorage.removeItem('shcs_token');
  localStorage.removeItem('shcs_user');
};
