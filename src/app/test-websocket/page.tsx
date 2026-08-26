'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

export default function WebSocketTest() {
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState('🔴 Disconnected');
  const [token, setToken] = useState('YOUR_VALID_JWT_HERE');
  const [brokerUrl, setBrokerUrl] = useState('ws://localhost:8080/ws');
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  const connectWebSocket = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
    }

    const stompClient = new Client({
      brokerURL: brokerUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`, // Caught by backend ChannelInterceptor
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setStatus('🟢 Connected');
        setIsConnected(true);

        // Subscribe to private customer queue
        stompClient.subscribe('/user/queue/orders', (message) => {
          try {
            const event = JSON.parse(message.body);
            setMessages((prev) => [
              ...prev,
              `[${event.timestamp || new Date().toLocaleTimeString()}] ${event.type || 'EVENT'}: Order ${
                event.data?.orderId || 'N/A'
              } is now ${event.data?.status || 'UPDATED'}`,
            ]);
          } catch {
            setMessages((prev) => [...prev, `[Message] ${message.body}`]);
          }
        });
      },
      onDisconnect: () => {
        setStatus('🔴 Disconnected');
        setIsConnected(false);
      },
      onWebSocketError: () => {
        setStatus('⚠️ Error connecting');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        setStatus(`⚠️ STOMP error: ${frame.headers['message'] || 'Broker reported error'}`);
        setIsConnected(false);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;
  }, [brokerUrl, token]);

  const disconnectWebSocket = () => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setStatus('🔴 Disconnected');
      setIsConnected(false);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [connectWebSocket]);

  return (
    <div className="min-h-screen bg-surface p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-level-2 border border-surface-dim/40">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-dim/30">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">WebSocket Test Client</h1>
            <p className="text-sm text-secondary">STOMP over WebSocket connection tester</p>
          </div>
          <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-surface-container text-on-surface">
            Status: <span className="ml-1.5">{status}</span>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              Broker URL
            </label>
            <input
              type="text"
              value={brokerUrl}
              onChange={(e) => setBrokerUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface rounded-md border border-surface-dim text-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
              placeholder="ws://localhost:8080/ws"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              JWT Bearer Token
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface rounded-md border border-surface-dim text-sm font-mono text-on-surface focus:outline-none focus:border-secondary transition-colors"
              placeholder="Enter JWT Token"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={connectWebSocket}
              className="px-5 py-2.5 bg-primary text-on-primary font-semibold text-sm rounded-md hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
            >
              {isConnected ? 'Reconnect' : 'Connect'}
            </button>
            {isConnected && (
              <button
                onClick={disconnectWebSocket}
                className="px-5 py-2.5 bg-error text-on-error font-semibold text-sm rounded-md hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
              >
                Disconnect
              </button>
            )}
            <button
              onClick={() => setMessages([])}
              className="px-4 py-2.5 bg-surface-container text-on-surface font-semibold text-sm rounded-md hover:bg-surface-container-high active:scale-[0.98] transition-all"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
              Received Messages ({messages.length})
            </h2>
            <span className="text-xs text-secondary font-mono">/user/queue/orders</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-md border border-surface-dim/40 h-72 overflow-y-auto font-mono text-xs text-on-surface space-y-1.5">
            {messages.length === 0 ? (
              <div className="text-secondary/60 italic flex items-center justify-center h-full">
                Waiting for WebSocket messages...
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className="p-2 bg-surface-container-lowest rounded border border-surface-dim/30 animate-in fade-in duration-200"
                >
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
