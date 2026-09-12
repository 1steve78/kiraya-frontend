import { useEffect, useState } from 'react';
import { useWebSocket } from '@/lib/websocket/WebSocketContext';
import { triggerNotification } from '@/hooks/useNotifications';

export interface DeliveryEvent {
  type: 'NEW_DELIVERY' | 'DELIVERY_ASSIGNED' | 'DELIVERY_STATUS_CHANGED' | 'DELIVERY_CANCELLED';
  timestamp: string;
  data: {
    orderId: number;
    status: string;
    deliveryPartnerId?: number;
  };
}

export function useDeliveryUpdates() {
  const { client, connectionState } = useWebSocket();
  const [lastEvent, setLastEvent] = useState<DeliveryEvent | null>(null);

  useEffect(() => {
    if (!client || connectionState !== 'CONNECTED') return;

    const handleMessage = (body: string) => {
      try {
        const event: DeliveryEvent = JSON.parse(body);
        setLastEvent(event);
        
        // Trigger global notification dynamically
        if (event.type === 'NEW_DELIVERY') {
          triggerNotification({
            type: 'delivery',
            title: '🔔 New delivery available',
            message: `Order #${event.data.orderId} is ready for pickup.`,
          });
        } else if (event.type === 'DELIVERY_STATUS_CHANGED') {
          triggerNotification({
            type: 'info',
            title: 'Delivery Status Updated',
            message: `Order #${event.data.orderId} is now ${event.data.status}.`,
          });
        }
      } catch {
        // ignore
      }
    };

    // Listen to the generic pool
    const poolSub = client.subscribe('/topic/deliveries/pool', (message) => {
      handleMessage(message.body);
    });

    // Listen to personal queue
    const userSub = client.subscribe('/user/queue/delivery-orders', (message) => {
      handleMessage(message.body);
    });

    return () => {
      poolSub.unsubscribe();
      userSub.unsubscribe();
    };
  }, [client, connectionState]);

  return {
    isConnected: connectionState === 'CONNECTED',
    connectionState,
    lastEvent
  };
}
