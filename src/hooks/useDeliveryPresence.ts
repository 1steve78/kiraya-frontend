import { useState, useEffect, useRef, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { 
  AvailabilityStatus, 
  goOnline as apiGoOnline, 
  goOffline as apiGoOffline, 
  sendHeartbeat,
  getMyPresence
} from '@/lib/api/presence';

export function useDeliveryPresence() {
  const [status, setStatus] = useState<AvailabilityStatus>('OFFLINE');
  const [isLoading, setIsLoading] = useState(true);
  const partnerIdRef = useRef<number | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize partnerId from token and fetch initial presence
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken.id) {
          partnerIdRef.current = decodedToken.id;
        }
      }
    } catch (err) {
      console.error('Error decoding token for presence:', err);
    }

    const initPresence = async () => {
      if (!partnerIdRef.current) {
        setIsLoading(false);
        return;
      }
      try {
        const initialPresence = await getMyPresence(partnerIdRef.current);
        setStatus(initialPresence.status);
      } catch (err) {
        console.error('Failed to get initial presence', err);
        setStatus('OFFLINE');
      } finally {
        setIsLoading(false);
      }
    };

    initPresence();

    return () => {
      stopHeartbeat();
    };
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    if (!partnerIdRef.current) return;
    
    // Heartbeat every 10 seconds
    heartbeatIntervalRef.current = setInterval(async () => {
      if (!partnerIdRef.current) return;
      try {
        await sendHeartbeat(partnerIdRef.current);
      } catch (err) {
        console.warn('Heartbeat failed, might be offline on server', err);
        // If it fails with 410 GONE, it means they expired on the server side
        // We could force them offline locally:
        // setStatus('OFFLINE');
        // stopHeartbeat();
      }
    }, 10000);
  }, [stopHeartbeat]);

  // Sync heartbeat based on current status
  useEffect(() => {
    if (status === 'ONLINE' || status === 'BUSY') {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }
  }, [status, startHeartbeat, stopHeartbeat]);

  const goOnline = async () => {
    if (!partnerIdRef.current) return;
    try {
      setIsLoading(true);
      const res = await apiGoOnline(partnerIdRef.current);
      setStatus(res.status);
    } catch (err) {
      console.error('Failed to go online:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const goOffline = async () => {
    if (!partnerIdRef.current) return;
    try {
      setIsLoading(true);
      const res = await apiGoOffline(partnerIdRef.current);
      setStatus(res.status);
    } catch (err) {
      console.error('Failed to go offline:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    status,
    isLoading,
    goOnline,
    goOffline
  };
}
