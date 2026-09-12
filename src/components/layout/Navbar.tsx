'use client';

import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from './UserMenu';
import { useWebSocket } from '@/lib/websocket/WebSocketContext';

export function Navbar() {
  const { user } = useAuth();
  const { connectionState } = useWebSocket();

  if (!user) return null;

  // Determine status color and text for delivery partners
  let statusColor = 'bg-slate-500';
  let statusBg = 'bg-slate-50 border-slate-200';
  let statusText = 'Offline';
  
  if (connectionState === 'CONNECTED') {
    statusColor = 'bg-green-500 animate-pulse';
    statusBg = 'bg-green-50 border-green-200';
    statusText = 'Live';
  } else if (connectionState === 'CONNECTING' || connectionState === 'RECONNECTING') {
    statusColor = 'bg-amber-500 animate-pulse';
    statusBg = 'bg-amber-50 border-amber-200';
    statusText = 'Reconnecting';
  }

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 relative">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Page Title */}
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-slate-800">
            Welcome, {user.name.split(' ')[0]}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection Status Indicator */}
        {user.role === 'DELIVERY_PARTNER' && (
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border ${statusBg}`}>
            <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
            <span className="text-xs font-semibold text-slate-700">{statusText}</span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User Menu / Avatar Profile */}
        <UserMenu />
      </div>
    </header>
  );
}
