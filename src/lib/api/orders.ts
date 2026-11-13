// lib/api/orders.ts
import { apiClient } from './client';
import { Order, OrderStatus } from '@/types/order';
import { EtaResponse } from '@/types/delivery';

export const ordersApi = {
  /**
   * Fetches the current snapshot of an order by ID.
   */
  async getOrder(orderId: string | number): Promise<Order> {
    return apiClient.get<Order>(`/orders/${orderId}`);
  },

  /**
   * Fetches all orders for the current authenticated customer.
   */
  async getMyOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>(`/orders`);
  },

  /**
   * Updates the status of an order (PATCH — backend only accepts PATCH).
   * Body uses { status } which maps to the backend's renamed field.
   */
  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${orderId}/status`, { status });
  },

  /**
   * Fetches the latest known delivery location snapshot for an order.
   */
  async getDeliveryLocation(orderId: string | number): Promise<{
    type?: string;
    deliveryId?: string | number;
    lat: number;
    lng: number;
    timestamp?: string;
  } | null> {
    try {
      const res = await apiClient.get<{
        type?: string;
        deliveryId?: string | number;
        lat: number;
        lng: number;
        timestamp?: string;
      }>(`/orders/${orderId}/location`);
      return res || null;
    } catch {
      return null;
    }
  },

  /**
   * Fetches the current estimated time of arrival (ETA) snapshot for an order.
   */
  async getDeliveryEta(orderId: string | number): Promise<EtaResponse | null> {
    try {
      const res = await apiClient.get<EtaResponse>(`/orders/${orderId}/eta`);
      return res || null;
    } catch {
      return null;
    }
  },
};
