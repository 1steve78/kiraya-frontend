import { useEffect, useState, useRef } from 'react';
import { createStompClient } from '@/lib/websocket/stompClient';

export interface DeliveryEvent {
  type: 'NEW_DELIVERY' | 'DELIVERY_ASSIGNED' | 'DELIVERY_STATUS_CHANGED' | 'DELIVERY_CANCELLED';
  timestamp: string;
  data: {
    orderId: number;
    status: string;
    deliveryPartnerId?: number;
  };
}

export type ConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export function useDeliveryUpdates() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('CONNECTING');
  const [lastEvent, setLastEvent] = useState<DeliveryEvent | null>(null);
  
  const hasConnectedOnce = useRef(false);

  useEffect(() => {
    const client = createStompClient();

    client.onConnect = () => {
      if (hasConnectedOnce.current) {
        setConnectionState('RECONNECTING');
      }

      setConnectionState('CONNECTED');
      hasConnectedOnce.current = true;

      const handleMessage = (body: string) => {
        try {
          const event: DeliveryEvent = JSON.parse(body);
          setLastEvent(event);
        } catch {
          // ignore
        }
      };

      // Listen to the generic pool
      client.subscribe('/topic/deliveries/pool', (message) => {
        handleMessage(message.body);
      });

      // Listen to personal queue
      client.subscribe('/user/queue/delivery-orders', (message) => {
        handleMessage(message.body);
      });
    };

    client.onWebSocketError = () => setConnectionState('DISCONNECTED');
    client.onWebSocketClose = () => setConnectionState('DISCONNECTED');
    client.onStompError = () => setConnectionState('DISCONNECTED');

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  return {
    isConnected: connectionState === 'CONNECTED',
    connectionState,
    lastEvent
  };
}
