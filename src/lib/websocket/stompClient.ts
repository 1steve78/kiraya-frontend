// lib/websocket/stompClient.ts
import { Client } from '@stomp/stompjs';

export function createStompClient(customToken?: string): Client {
  const token = customToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  
  // Convert http://localhost:8080 to ws://localhost:8080/ws
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws';

  return new Client({
    brokerURL: wsUrl,
    connectHeaders: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // Attempt reconnection every 5 seconds if connection drops
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });
}
