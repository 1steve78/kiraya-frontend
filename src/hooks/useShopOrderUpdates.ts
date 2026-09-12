// hooks/useShopOrderUpdates.ts
import { useEffect, useState, useRef } from 'react';
import { useWebSocket } from '@/lib/websocket/WebSocketContext';
import { triggerNotification } from '@/hooks/useNotifications';
import {
  ShopRealtimeEvent,
  NewOrderEvent,
  OrderStatusChangedEvent,
  OrderCancelledEvent,
  OrderAssignedEvent,
} from '@/types/realtime';
import { ConnectionState } from './useOrderUpdates';

export interface UseShopOrderUpdatesOptions {
  onNewOrder?: (event: NewOrderEvent) => void;
  onStatusChanged?: (event: OrderStatusChangedEvent) => void;
  onOrderCancelled?: (event: OrderCancelledEvent) => void;
  onOrderAssigned?: (event: OrderAssignedEvent) => void;
  onEvent?: (event: ShopRealtimeEvent) => void;
  onReconnect?: () => void;
}

export function useShopOrderUpdates(
  shopId: number | string = 1,
  options?: UseShopOrderUpdatesOptions
) {
  const { client, connectionState } = useWebSocket();
  const [lastEvent, setLastEvent] = useState<ShopRealtimeEvent | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Store options in stable ref to avoid unnecessary subscription resets
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!client || connectionState !== 'CONNECTED') return;

    const handleIncomingMessage = (messageBody: string) => {
      try {
        const event: ShopRealtimeEvent = JSON.parse(messageBody);
        setLastEvent(event);
        setLastUpdated(new Date());

        optionsRef.current?.onEvent?.(event);

        switch (event.type) {
          case 'NEW_ORDER':
            triggerNotification({
              type: 'order',
              title: '🎉 New Order Received',
              message: `Order #${event.data.orderId} was just placed.`,
            });
            optionsRef.current?.onNewOrder?.(event);
            break;
          case 'ORDER_STATUS_CHANGED':
            triggerNotification({
              type: 'info',
              title: 'Order Status Changed',
              message: `Order #${event.data.orderId} is now ${event.data.status}.`,
            });
            optionsRef.current?.onStatusChanged?.(event);
            break;
          case 'ORDER_CANCELLED':
            triggerNotification({
              type: 'error',
              title: 'Order Cancelled',
              message: `Order #${event.data.orderId} has been cancelled.`,
            });
            optionsRef.current?.onOrderCancelled?.(event);
            break;
          case 'ORDER_ASSIGNED':
            optionsRef.current?.onOrderAssigned?.(event);
            break;
          default:
            break;
        }
      } catch {
        // Non-JSON or unrecognized format
      }
    };

    // Broadcast topic — backend publishes ORDER_STATUS_CHANGED, NEW_ORDER, ORDER_CANCELLED here
    const topicSub = client.subscribe(`/topic/shops/${shopId}`, (message) => {
      handleIncomingMessage(message.body);
    });

    // Shop orders sub-topic — also receives the same events
    const ordersSub = client.subscribe(`/topic/shops/${shopId}/orders`, (message) => {
      handleIncomingMessage(message.body);
    });

    // Authenticated user queue — backend sends to /user/{email}/queue/shop-orders
    const queueSub = client.subscribe(`/user/queue/shop-orders`, (message) => {
      handleIncomingMessage(message.body);
    });

    return () => {
      topicSub.unsubscribe();
      ordersSub.unsubscribe();
      queueSub.unsubscribe();
    };
  }, [client, connectionState, shopId]);

  return { connectionState, lastEvent, lastUpdated };
}
