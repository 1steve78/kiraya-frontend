'use client';
import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { NotificationContainer } from '@/components/notifications/NotificationContainer';
import { WebSocketProvider } from '@/lib/websocket/WebSocketContext';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <WebSocketProvider>
      <div className="flex h-screen bg-[#f8f9ff] overflow-hidden font-sans antialiased">
        {/* Sidebar - fixed on the left for md+ screens */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 h-screen">
          {/* Top Navbar */}
          <Navbar />

          {/* Global Notifications */}
          <NotificationContainer />

          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </WebSocketProvider>
  );
}
