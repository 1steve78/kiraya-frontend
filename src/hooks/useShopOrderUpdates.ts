// hooks/useShopOrderUpdates.ts
import { useEffect, useState, useRef } from 'react';
import { createStompClient } from '@/lib/websocket/stompClient';
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
  const [connectionState, setConnectionState] = useState<ConnectionState>('CONNECTING');
  const [lastEvent, setLastEvent] = useState<ShopRealtimeEvent | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const hasConnectedOnce = useRef(false);

  // Store options in stable ref to avoid unnecessary subscription resets
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const client = createStompClient();

    client.onConnect = () => {
      if (hasConnectedOnce.current) {
        setConnectionState('RECONNECTING');
        optionsRef.current?.onReconnect?.();
      }

      setConnectionState('CONNECTED');
      hasConnectedOnce.current = true;

      const handleIncomingMessage = (messageBody: string) => {
        try {
          const event: ShopRealtimeEvent = JSON.parse(messageBody);
          setLastEvent(event);
          setLastUpdated(new Date());

          optionsRef.current?.onEvent?.(event);

          switch (event.type) {
            case 'NEW_ORDER':
              optionsRef.current?.onNewOrder?.(event);
              break;
            case 'ORDER_STATUS_CHANGED':
              optionsRef.current?.onStatusChanged?.(event);
              break;
            case 'ORDER_CANCELLED':
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
      client.subscribe(`/topic/shops/${shopId}`, (message) => {
        handleIncomingMessage(message.body);
      });

      // Shop orders sub-topic — also receives the same events
      client.subscribe(`/topic/shops/${shopId}/orders`, (message) => {
        handleIncomingMessage(message.body);
      });

      // Authenticated user queue — backend sends to /user/{email}/queue/shop-orders
      // Spring translates this to /user/queue/shop-orders for the connected user
      client.subscribe(`/user/queue/shop-orders`, (message) => {
        handleIncomingMessage(message.body);
      });
    };

    client.onWebSocketError = () => setConnectionState('DISCONNECTED');
    client.onWebSocketClose = () => setConnectionState('DISCONNECTED');
    client.onStompError = () => setConnectionState('DISCONNECTED');

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [shopId]);

  return { connectionState, lastEvent, lastUpdated };
}
