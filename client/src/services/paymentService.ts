import { apiFetch } from './api';

export interface CreatePaymentData {
  amount: number;
  description?: string;
  appointmentId?: string;
}

export interface ExecutePaymentData {
  paymentId: string;
  PayerID: string;
}

// Create payment
export const createPayment = async (paymentData: CreatePaymentData) => {
  return apiFetch('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

// Execute payment (after PayPal approval)
export const executePayment = async (executeData: ExecutePaymentData) => {
  return apiFetch('/payments/execute', {
    method: 'POST',
    body: JSON.stringify(executeData),
  });
};

// Get user's payments
export const getMyPayments = async () => {
  return apiFetch('/payments/me', {
    method: 'GET',
  });
};

// Get payment by ID
export const getPaymentById = async (id: string) => {
  return apiFetch(`/payments/${id}`, {
    method: 'GET',
  });
};

// Get all payments (Admin/Staff)
export const getAllPayments = async (filters?: { status?: string; userId?: string }) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/payments/all?${queryParams}` : '/payments/all';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Refund payment (Admin/Staff)
export const refundPayment = async (id: string) => {
  return apiFetch(`/payments/refund/${id}`, {
    method: 'POST',
  });
};

// Retry payment (UC-001 Extension 6a)
export const retryPayment = async (id: string) => {
  return apiFetch(`/payments/retry/${id}`, {
    method: 'POST',
  });
};

// Use alternate payment method (UC-001 Extension 6a)
export interface AlternatePaymentData {
  originalPaymentId: string;
  paymentMethod: 'PayPal' | 'Card' | 'Cash';
  amount?: number;
  description?: string;
}

export const useAlternatePayment = async (paymentData: AlternatePaymentData) => {
  return apiFetch('/payments/alternate', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};
