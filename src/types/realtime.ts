// types/realtime.ts
import { Order, OrderStatus } from './order';

// Base event interface
export interface RealtimeEvent {
  type: string;
  timestamp: string;
}

// 1. When a customer places a new order
export interface NewOrderEvent extends RealtimeEvent {
  type: 'NEW_ORDER';
  data: {
    orderId: number;
    order?: Order;
    shopId?: number;
    totalAmount?: number;
    itemCount?: number;
  };
}

// 2. When an order status changes along the state machine
export interface OrderStatusChangedEvent extends RealtimeEvent {
  type: 'ORDER_STATUS_CHANGED';
  data: {
    orderId: number;
    status: OrderStatus;
  };
}

// 3. When a delivery partner is assigned to an order
export interface OrderAssignedEvent extends RealtimeEvent {
  type: 'ORDER_ASSIGNED';
  data: {
    orderId: number;
    deliveryPartnerId?: number;
    deliveryPartnerName?: string;
  };
}

// 4. When an order is cancelled/rejected
export interface OrderCancelledEvent extends RealtimeEvent {
  type: 'ORDER_CANCELLED';
  data: {
    orderId: number;
    reason?: string;
  };
}

export type RealtimeEventType =
  | 'NEW_ORDER'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_ASSIGNED'
  | 'ORDER_CANCELLED';

// Discriminated union of all real-time events in the platform
export type ShopRealtimeEvent =
  | NewOrderEvent
  | OrderStatusChangedEvent
  | OrderAssignedEvent
  | OrderCancelledEvent;
