// lib/api/orders.ts
import { apiClient } from './client';
import { Order, OrderStatus } from '@/types/order';

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
};
