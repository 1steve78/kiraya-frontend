'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useWebSocket, ConnectionState } from '@/lib/websocket/WebSocketContext';
import { ordersApi } from '@/lib/api/orders';
import { DeliveryLocationUpdatedEvent } from '@/types/realtime';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface UseDeliveryTrackingOptions {
  onLocationUpdate?: (coords: LocationCoordinates) => void;
  onResync?: () => void;
}

export interface DeliveryTrackingState {
  coordinates: LocationCoordinates | null;
  lastUpdated: Date | null;
  connectionState: ConnectionState;
  isTracking: boolean;
  error: string | null;
  resync: () => Promise<void>;
}

/**
 * Custom hook for tracking delivery partner coordinates in real-time.
 * 
 * Features:
 * 1. Subscribes to the authorized delivery location topic (/topic/delivery/{id}/location).
 * 2. Parses incoming DELIVERY_LOCATION_UPDATED events.
 * 3. Stores latest coordinates in React state.
 * 4. Ignores out-of-order/delayed GPS updates (older timestamps).
 * 5. Cleans up / unsubscribes on unmount or deliveryId change.
 * 6. Fetches current state & location via REST on connect and reconnection.
 */
export function useDeliveryTracking(
  deliveryId: number | string | null | undefined,
  options?: UseDeliveryTrackingOptions
): DeliveryTrackingState {
  const { client, connectionState } = useWebSocket();
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clean numeric/string ID (strips 'delivery-' prefix if present)
  const cleanId = deliveryId ? String(deliveryId).replace(/^delivery-/, '').trim() : null;

  // Track latest accepted timestamp in ms to drop out-of-order / delayed GPS packets
  const lastTimestampRef = useRef<number | null>(null);

  // Stable callbacks ref
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Reset tracking state whenever the deliveryId changes
  useEffect(() => {
    lastTimestampRef.current = null;
    setCoordinates(null);
    setLastUpdated(null);
    setError(null);
  }, [cleanId]);

  // REST Resynchronization function: fetches latest delivery state and location snapshot
  const resync = useCallback(async () => {
    if (!cleanId) return;

    try {
      // 1. Fetch current delivery state via REST
      await ordersApi.getOrder(cleanId);
      if (optionsRef.current?.onResync) {
        optionsRef.current.onResync();
      }

      // 2. Fetch latest location snapshot via REST if available
      const locSnapshot = await ordersApi.getDeliveryLocation(cleanId);
      if (
        locSnapshot &&
        typeof locSnapshot.lat === 'number' &&
        typeof locSnapshot.lng === 'number' &&
        !isNaN(locSnapshot.lat) &&
        !isNaN(locSnapshot.lng)
      ) {
        const snapshotTime = locSnapshot.timestamp
          ? new Date(locSnapshot.timestamp).getTime()
          : Date.now();

        // Check if snapshot is newer or at least as fresh as our current state
        if (lastTimestampRef.current === null || snapshotTime >= lastTimestampRef.current) {
          lastTimestampRef.current = snapshotTime;
          const newCoords: LocationCoordinates = {
            lat: locSnapshot.lat,
            lng: locSnapshot.lng,
          };
          setCoordinates(newCoords);
          setLastUpdated(new Date(snapshotTime));
          if (optionsRef.current?.onLocationUpdate) {
            optionsRef.current.onLocationUpdate(newCoords);
          }
        }
      }
      setError(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to synchronize delivery state';
      setError(errMsg);
    }
  }, [cleanId]);

  // Trigger REST resync on initial mount / whenever WebSocket connects or reconnects
  useEffect(() => {
    if (connectionState === 'CONNECTED' && cleanId) {
      void resync();
    }
  }, [connectionState, cleanId, resync]);

  // WebSocket Subscription for live location updates
  useEffect(() => {
    if (!client || connectionState !== 'CONNECTED' || !cleanId) {
      return;
    }

    const handleMessage = (body: string) => {
      try {
        const event: DeliveryLocationUpdatedEvent = JSON.parse(body);

        // Accept DELIVERY_LOCATION_UPDATED events or any event containing lat & lng
        const isLocationEvent =
          event.type === 'DELIVERY_LOCATION_UPDATED' ||
          (event.lat !== undefined && event.lng !== undefined);

        if (!isLocationEvent) {
          return;
        }

        // Verify delivery ID match if present in the event
        if (event.deliveryId) {
          const eventDeliveryId = String(event.deliveryId).replace(/^delivery-/, '').trim();
          if (eventDeliveryId !== cleanId) {
            return;
          }
        }

        const lat = Number(event.lat);
        const lng = Number(event.lng);

        // Coordinate sanity checks
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return;
        }

        // Out-of-order check: ignore older timestamps
        const eventTimestamp = event.timestamp ? new Date(event.timestamp).getTime() : Date.now();
        if (lastTimestampRef.current !== null && eventTimestamp <= lastTimestampRef.current) {
          return;
        }

        lastTimestampRef.current = eventTimestamp;
        const newCoords: LocationCoordinates = { lat, lng };
        setCoordinates(newCoords);
        setLastUpdated(new Date(eventTimestamp));

        if (optionsRef.current?.onLocationUpdate) {
          optionsRef.current.onLocationUpdate(newCoords);
        }
      } catch {
        // Non-JSON or corrupt WebSocket payload — ignore
      }
    };

    // 1. Subscribe to authorized delivery topic
    const topicSub = client.subscribe(`/topic/delivery/${cleanId}/location`, (message) => {
      handleMessage(message.body);
    });

    // 2. Subscribe to authorized private user queue
    const queueSub = client.subscribe('/user/queue/delivery-location', (message) => {
      handleMessage(message.body);
    });

    // Clean up subscriptions when component unmounts or deliveryId changes
    return () => {
      topicSub.unsubscribe();
      queueSub.unsubscribe();
    };
  }, [client, connectionState, cleanId]);

  return {
    coordinates,
    lastUpdated,
    connectionState,
    isTracking: connectionState === 'CONNECTED' && coordinates !== null,
    error,
    resync,
  };
}
