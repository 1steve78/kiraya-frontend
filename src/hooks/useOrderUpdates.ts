// hooks/useOrderUpdates.ts
import { useEffect, useState, useRef } from 'react';
import { useWebSocket } from '@/lib/websocket/WebSocketContext';
import { triggerNotification } from '@/hooks/useNotifications';
import { OrderStatus } from '@/types/order';
import { ShopRealtimeEvent } from '@/types/realtime';

export type ConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export function useOrderUpdates(orderId: number | string, onReconnect: () => void) {
  const { client, connectionState } = useWebSocket();
  const [liveStatus, setLiveStatus] = useState<OrderStatus | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Track if we've successfully connected at least once
  const hasConnectedOnce = useRef(false);

  // Stable reference for the callback to prevent stale closures and effect re-runs
  const onReconnectRef = useRef(onReconnect);
  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  // Handle reconnect trigger based on connectionState changes
  useEffect(() => {
    if (connectionState === 'CONNECTED') {
      if (hasConnectedOnce.current) {
        onReconnectRef.current();
      }
      hasConnectedOnce.current = true;
    }
  }, [connectionState]);

  useEffect(() => {
    if (!client || connectionState !== 'CONNECTED') return;

    const handleMessage = (body: string) => {
      try {
        const event: ShopRealtimeEvent = JSON.parse(body);
        if (event.type === 'ORDER_STATUS_CHANGED') {
          setLiveStatus(event.data.status as OrderStatus); // Assuming status is what's passed
          setLastUpdated(new Date());
          triggerNotification({
            type: 'info',
            title: 'Order Status Update',
            message: `Your order is now ${event.data.status}.`,
          });
        }
      } catch {
        // Non-JSON or unrecognized message — ignore
      }
    };

    // Subscribe to broadcast topic (works without authentication)
    const topicSub = client.subscribe(`/topic/orders/${orderId}`, (message) => {
      handleMessage(message.body);
    });

    // Subscribe to user-specific queue (requires authenticated STOMP connection)
    const queueSub = client.subscribe(`/user/queue/orders`, (message) => {
      handleMessage(message.body);
    });

    // Cleanup when component unmounts
    return () => {
      topicSub.unsubscribe();
      queueSub.unsubscribe();
    };
  }, [client, connectionState, orderId]);

  return { connectionState, liveStatus, lastUpdated };
}
