'use client';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { createStompClient } from './stompClient';
import { useAuth } from '@/hooks/useAuth';

export type ConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

interface WebSocketContextValue {
  client: Client | null;
  connectionState: ConnectionState;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  client: null,
  connectionState: 'DISCONNECTED',
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
  const hasConnectedOnce = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (client) {
        client.deactivate();
        setClient(null);
      }
      setConnectionState('DISCONNECTED');
      hasConnectedOnce.current = false;
      return;
    }

    setConnectionState(hasConnectedOnce.current ? 'RECONNECTING' : 'CONNECTING');
    const stompClient = createStompClient();

    stompClient.onConnect = () => {
      setConnectionState('CONNECTED');
      hasConnectedOnce.current = true;
    };

    stompClient.onWebSocketError = () => {
      setConnectionState('DISCONNECTED');
    };
    
    stompClient.onWebSocketClose = () => {
      setConnectionState('DISCONNECTED');
    };
    
    stompClient.onStompError = () => {
      setConnectionState('DISCONNECTED');
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [isAuthenticated]);

  return (
    <WebSocketContext.Provider value={{ client, connectionState }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
