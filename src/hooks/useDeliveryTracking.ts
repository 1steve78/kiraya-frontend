'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useWebSocket, ConnectionState } from '@/lib/websocket/WebSocketContext';
import { ordersApi } from '@/lib/api/orders';
import { DeliveryLocationUpdatedEvent, EtaChangedEvent } from '@/types/realtime';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface UseDeliveryTrackingOptions {
  onLocationUpdate?: (coords: LocationCoordinates) => void;
  onEtaUpdate?: (eta: { etaMinutes: number; estimatedArrival: Date }) => void;
  onResync?: () => void;
}

export interface DeliveryTrackingState {
  coordinates: LocationCoordinates | null;
  lastUpdated: Date | null;
  connectionState: ConnectionState;
  isTracking: boolean;
  error: string | null;
  resync: () => Promise<void>;
  etaMinutes: number | null;
  estimatedArrival: Date | null;
  etaLastUpdated: Date | null;
  isEtaStale: boolean;
}

/**
 * Custom hook for tracking delivery partner coordinates and dynamic ETA in real-time.
 * 
 * Features:
 * 1. Subscribes to live GPS coordinates (/topic/delivery/{id}/location and /user/queue/delivery-location).
 * 2. Subscribes to dynamic ETA updates (/topic/delivery/{id}/eta and /user/queue/delivery-eta).
 * 3. Handles ETA_CHANGED events smoothly without jitter.
 * 4. Tracks staleness indicator when updates haven't arrived.
 * 5. Cleans up / unsubscribes on unmount or deliveryId change.
 * 6. Fetches current state, location snapshot, and ETA snapshot via REST on connect and reconnection.
 */
export function useDeliveryTracking(
  deliveryId: number | string | null | undefined,
  options?: UseDeliveryTrackingOptions
): DeliveryTrackingState {
  const { client, connectionState } = useWebSocket();
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const [etaLastUpdated, setEtaLastUpdated] = useState<Date | null>(null);
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
    setEtaMinutes(null);
    setEstimatedArrival(null);
    setEtaLastUpdated(null);
    setError(null);
  }, [cleanId]);

  // REST Resynchronization function: fetches latest delivery state, location snapshot, and ETA snapshot
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

      // 3. Fetch latest ETA snapshot via REST
      const etaSnapshot = await ordersApi.getDeliveryEta(cleanId);
      if (etaSnapshot && typeof etaSnapshot.etaMinutes === 'number') {
        setEtaMinutes(etaSnapshot.etaMinutes);
        if (etaSnapshot.estimatedArrival) {
          setEstimatedArrival(new Date(etaSnapshot.estimatedArrival));
        }
        setEtaLastUpdated(
          etaSnapshot.calculatedAt ? new Date(etaSnapshot.calculatedAt) : new Date()
        );
        if (optionsRef.current?.onEtaUpdate && etaSnapshot.estimatedArrival) {
          optionsRef.current.onEtaUpdate({
            etaMinutes: etaSnapshot.etaMinutes,
            estimatedArrival: new Date(etaSnapshot.estimatedArrival),
          });
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

  // WebSocket Subscription for live location & ETA updates
  useEffect(() => {
    if (!client || connectionState !== 'CONNECTED' || !cleanId) {
      return;
    }

    // Handler for live GPS location updates
    const handleLocationMessage = (body: string) => {
      try {
        const event: DeliveryLocationUpdatedEvent = JSON.parse(body);

        const isLocationEvent =
          event.type === 'DELIVERY_LOCATION_UPDATED' ||
          (event.lat !== undefined && event.lng !== undefined);

        if (!isLocationEvent) {
          return;
        }

        if (event.deliveryId) {
          const eventDeliveryId = String(event.deliveryId).replace(/^delivery-/, '').trim();
          if (eventDeliveryId !== cleanId) {
            return;
          }
        }

        const lat = Number(event.lat);
        const lng = Number(event.lng);

        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return;
        }

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
        // Non-JSON or corrupt payload
      }
    };

    // Handler for dynamic ETA updates
    const handleEtaMessage = (body: string) => {
      try {
        const event: EtaChangedEvent = JSON.parse(body);

        if (event.type === 'ETA_CHANGED' || event.etaMinutes !== undefined) {
          if (event.deliveryId) {
            const eventDeliveryId = String(event.deliveryId).replace(/^delivery-/, '').trim();
            if (eventDeliveryId !== cleanId) {
              return;
            }
          }

          const minutes = Number(event.etaMinutes);
          if (!isNaN(minutes)) {
            setEtaMinutes(minutes);
            const arrival = event.estimatedArrival ? new Date(event.estimatedArrival) : null;
            setEstimatedArrival(arrival);
            const now = event.calculatedAt ? new Date(event.calculatedAt) : new Date();
            setEtaLastUpdated(now);

            if (optionsRef.current?.onEtaUpdate && arrival) {
              optionsRef.current.onEtaUpdate({
                etaMinutes: minutes,
                estimatedArrival: arrival,
              });
            }
          }
        }
      } catch {
        // Non-JSON or corrupt payload
      }
    };

    // 1. Subscribe to authorized delivery location topic & user queue
    const locationTopicSub = client.subscribe(`/topic/delivery/${cleanId}/location`, (m) => {
      handleLocationMessage(m.body);
    });
    const locationQueueSub = client.subscribe('/user/queue/delivery-location', (m) => {
      handleLocationMessage(m.body);
    });

    // 2. Subscribe to authorized delivery ETA topic & user queue
    const etaTopicSub = client.subscribe(`/topic/delivery/${cleanId}/eta`, (m) => {
      handleEtaMessage(m.body);
    });
    const etaQueueSub = client.subscribe('/user/queue/delivery-eta', (m) => {
      handleEtaMessage(m.body);
    });

    return () => {
      locationTopicSub.unsubscribe();
      locationQueueSub.unsubscribe();
      etaTopicSub.unsubscribe();
      etaQueueSub.unsubscribe();
    };
  }, [client, connectionState, cleanId]);

  // Determine if ETA is stale (e.g. no updates for > 90 seconds while active)
  const isEtaStale = Boolean(
    etaLastUpdated &&
      Date.now() - etaLastUpdated.getTime() > 90000 &&
      connectionState === 'CONNECTED'
  );

  return {
    coordinates,
    lastUpdated,
    connectionState,
    isTracking: connectionState === 'CONNECTED' && coordinates !== null,
    error,
    resync,
    etaMinutes,
    estimatedArrival,
    etaLastUpdated,
    isEtaStale,
  };
}
