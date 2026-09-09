// lib/api/shop.ts
import { apiClient } from './client';
import { Order, OrderStatus } from '@/types/order';

/**
 * Shop API Module
 * Architectural pattern:
 * React component -> shopApi -> apiClient -> Spring Boot (OrderStateMachine)
 *
 * Status updates go through PATCH /orders/{id}/status.
 * The backend OrderStateMachine evaluates whether the transition is valid.
 */
export const shopApi = {
  /**
   * Fetches all orders for the shop (returns plain List<OrderResponse> from backend).
   */
  async getShopOrders(shopId: number = 1): Promise<Order[]> {
    return apiClient.get<Order[]>(`/shops/${shopId}/orders`);
  },

  /**
   * Fetches a specific order by ID.
   */
  async getShopOrder(orderId: number | string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${orderId}`);
  },

  /**
   * Sends a PATCH /orders/{orderId}/status request.
   * Body: { status, reason? } — backend field is now named "status" (was renamed from orderStatus).
   * The backend state machine decides if the transition is legal.
   */
  async updateOrderStatus(
    orderId: number | string,
    status: OrderStatus,
    reason?: string
  ): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${orderId}/status`, { status, reason });
  },

  /**
   * Confirms a newly placed order (PENDING -> CONFIRMED).
   */
  async confirmOrder(orderId: number | string): Promise<Order> {
    return this.updateOrderStatus(orderId, 'CONFIRMED');
  },

  /**
   * Rejects / Cancels an order (transitions to CANCELLED).
   */
  async rejectOrder(orderId: number | string, reason?: string): Promise<Order> {
    return this.updateOrderStatus(orderId, 'CANCELLED', reason || 'Rejected by shop');
  },

  /**
   * Transitions an order to PREPARING (CONFIRMED -> PREPARING).
   */
  async startPreparing(orderId: number | string): Promise<Order> {
    return this.updateOrderStatus(orderId, 'PREPARING');
  },

  /**
   * Marks an order as ready for pickup (PREPARING -> READY_FOR_PICKUP).
   */
  async markReady(orderId: number | string): Promise<Order> {
    return this.updateOrderStatus(orderId, 'READY_FOR_PICKUP');
  },
};
