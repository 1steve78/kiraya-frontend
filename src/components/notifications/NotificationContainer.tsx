'use client';
import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from './Notification';

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  // The container itself is pointer-events-none so it doesn't block clicks underneath,
  // but individual notifications reset pointer-events to auto.
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end px-4 py-6 sm:p-6 gap-3 pt-20"
    >
      {notifications.map((notif) => (
        <Notification 
          key={notif.id} 
          notification={notif} 
          onClose={removeNotification} 
        />
      ))}
    </div>
  );
}
