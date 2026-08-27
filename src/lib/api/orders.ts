// lib/api/orders.ts
import { apiClient } from './client';
import { Order } from '@/types/order';

export const ordersApi = {
  /**
   * Fetches the current snapshot of an order by ID.
   */
  async getOrder(orderId: string | number): Promise<Order> {
    return apiClient.get<Order>(`/api/orders/${orderId}`);
  },
  
  // Later you can add:
  // async getMyOrders(): Promise<Order[]> { ... }
  // async cancelOrder(orderId: number): Promise<void> { ... }
};
