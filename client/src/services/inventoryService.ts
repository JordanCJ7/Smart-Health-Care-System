import { apiFetch } from './api';

export interface InventoryItem {
  _id?: string;
  drugName: string;
  genericName?: string;
  category?: string;
  quantity: number;
  unit?: string;
  reorderLevel: number;
  expiryDate: string;
  batchNumber?: string;
  supplier?: string;
  costPerUnit?: number;
  alternatives?: Array<{
    drugName: string;
    genericName?: string;
  }>;
  status?: 'Available' | 'Low Stock' | 'Out of Stock' | 'Expired';
  lastRestocked?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all inventory items
export const getAllInventory = async (filters?: {
  status?: string;
  lowStock?: boolean;
}) => {
  const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
  const endpoint = queryParams ? `/inventory?${queryParams}` : '/inventory';
  
  return apiFetch(endpoint, {
    method: 'GET',
  });
};

// Get inventory item by ID
export const getInventoryById = async (id: string) => {
  return apiFetch(`/inventory/${id}`, {
    method: 'GET',
  });
};

// Create inventory item
export const createInventoryItem = async (itemData: InventoryItem) => {
  return apiFetch('/inventory', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
};

// Update inventory item
export const updateInventoryItem = async (id: string, itemData: Partial<InventoryItem>) => {
  return apiFetch(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
};

// Delete inventory item
export const deleteInventoryItem = async (id: string) => {
  return apiFetch(`/inventory/${id}`, {
    method: 'DELETE',
  });
};

// Restock inventory item
export const restockInventory = async (
  id: string,
  quantity: number,
  batchNumber?: string,
  expiryDate?: string
) => {
  return apiFetch(`/inventory/${id}/restock`, {
    method: 'POST',
    body: JSON.stringify({ quantity, batchNumber, expiryDate }),
  });
};

// Check drug availability by name
export const checkDrugAvailability = async (drugName: string, quantity?: number) => {
  const queryParams = quantity ? `?quantity=${quantity}` : '';
  return apiFetch(`/inventory/check/${drugName}${queryParams}`, {
    method: 'GET',
  });
};
