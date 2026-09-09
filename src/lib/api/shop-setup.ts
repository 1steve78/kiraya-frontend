// lib/api/shop-setup.ts
import { apiClient } from './client';

export interface CreateShopPayload {
  name: string;
  address: string;
  phone: string;
}

export interface CreateShopResult {
  token: string;
  shop: {
    id: number;
    name: string;
    address: string;
    phone: string;
    ownerId: number;
  };
}

/**
 * Calls POST /shops.
 * On success, the backend returns a fresh JWT (with shopId embedded) plus the shop data.
 * We store the new token so all subsequent requests and guards use the updated claims.
 */
export async function createShopApi(payload: CreateShopPayload): Promise<CreateShopResult> {
  const response = await apiClient.post<CreateShopResult>('/shops', payload);

  // Replace old token with the fresh one that now includes shopId
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', response.token);
  }

  return response;
}
