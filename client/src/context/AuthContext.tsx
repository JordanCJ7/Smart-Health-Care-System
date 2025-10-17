import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

// Updated to only 3 roles: Patient, Staff, Admin
type Role = 'Admin' | 'Staff' | 'Patient';

type User = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  specialization?: string;
  department?: string;
  bloodType?: string;
  insurance?: {
    provider?: string;
    policyNumber?: string;
  };
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: authService.RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const json = localStorage.getItem('shcs_user');
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('shcs_token');
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('shcs_user', JSON.stringify(user));
    else localStorage.removeItem('shcs_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('shcs_token', token);
    else localStorage.removeItem('shcs_token');
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user as User);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: authService.RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user as User);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        register, 
        logout, 
        isAuthenticated: !!user && !!token,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export type { Role, User };

