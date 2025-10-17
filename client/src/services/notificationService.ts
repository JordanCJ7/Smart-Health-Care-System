import { apiFetch } from './api';

export interface Notification {
  _id: string;
  recipientId: string;
  senderId?: {
    _id: string;
    name: string;
    role: string;
  };
  type:
    | 'PRESCRIPTION_UNCLEAR'
    | 'DRUG_UNAVAILABLE'
    | 'PARTIAL_DISPENSE'
    | 'PAYMENT_FAILED'
    | 'PRESCRIPTION_DISPENSED'
    | 'INVENTORY_LOW'
    | 'GENERAL';
  title: string;
  message: string;
  relatedPrescriptionId?: any;
  relatedPaymentId?: any;
  metadata?: any;
  status: 'Unread' | 'Read' | 'Archived';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Get user's notifications
export const getMyNotifications = async (filters?: {
  status?: string;
  type?: string;
}) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/notifications/me?${queryParams}` : '/notifications/me';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Get notification by ID
export const getNotificationById = async (id: string) => {
  return apiFetch(`/notifications/${id}`, {
    method: 'GET',
  });
};

// Mark notification as read
export const markNotificationAsRead = async (id: string) => {
  return apiFetch(`/notifications/${id}/read`, {
    method: 'PUT',
  });
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  return apiFetch('/notifications/read-all', {
    method: 'PUT',
  });
};

// Delete notification
export const deleteNotification = async (id: string) => {
  return apiFetch(`/notifications/${id}`, {
    method: 'DELETE',
  });
};

// Get unread count
export const getUnreadCount = async () => {
  return apiFetch('/notifications/unread-count', {
    method: 'GET',
  });
};
