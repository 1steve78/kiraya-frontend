// hooks/useOrderUpdates.ts
import { useEffect, useState, useRef } from 'react';
import { createStompClient } from '@/lib/websocket/stompClient';
import { OrderStatus } from '@/types/order';
import { ShopRealtimeEvent } from '@/types/realtime';

export type ConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export function useOrderUpdates(orderId: number | string, onReconnect: () => void) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('CONNECTING');
  const [liveStatus, setLiveStatus] = useState<OrderStatus | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Track if we've successfully connected at least once
  const hasConnectedOnce = useRef(false);

  // Stable reference for the callback to prevent stale closures and effect re-runs
  const onReconnectRef = useRef(onReconnect);
  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    const client = createStompClient();

    client.onConnect = () => {
      // If we previously connected and are connecting again, it's a reconnection
      if (hasConnectedOnce.current) {
        setConnectionState('RECONNECTING');
        onReconnectRef.current(); // Trigger REST resync
      }

      setConnectionState('CONNECTED');
      hasConnectedOnce.current = true;

      const handleMessage = (body: string) => {
        try {
          const event: ShopRealtimeEvent = JSON.parse(body);
          if (event.type === 'ORDER_STATUS_CHANGED' || event.type === 'DELIVERY_STATUS_CHANGED') {
            setLiveStatus(event.data.status);
            setLastUpdated(new Date());
          }
        } catch {
          // Non-JSON or unrecognized message — ignore
        }
      };

      // Subscribe to broadcast topic (works without authentication)
      client.subscribe(`/topic/orders/${orderId}`, (message) => {
        handleMessage(message.body);
      });

      // Subscribe to user-specific queue (requires authenticated STOMP connection)
      client.subscribe(`/user/queue/orders`, (message) => {
        handleMessage(message.body);
      });
    };

    client.onWebSocketError = () => setConnectionState('DISCONNECTED');
    client.onWebSocketClose = () => setConnectionState('DISCONNECTED');
    client.onStompError = () => setConnectionState('DISCONNECTED');

    // Start the connection
    client.activate();

    // Cleanup when component unmounts
    return () => {
      client.deactivate();
    };
  }, [orderId]);

  return { connectionState, liveStatus, lastUpdated };
}
