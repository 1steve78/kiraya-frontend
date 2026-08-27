import { OrderStatus } from './order';

// Base event interface in case we add other real-time features later
export interface RealtimeEvent {
  type: string;
  timestamp: string;
}

// The specific event payload for order status changes
export interface OrderStatusChangedEvent extends RealtimeEvent {
  type: 'ORDER_STATUS_CHANGED';
  data: {
    orderId: number;
    status: OrderStatus;
  };
}
