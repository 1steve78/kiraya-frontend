'use client';
import { useEffect, useState } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'delivery' | 'order';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

// Global dispatcher function. 
// This is extremely powerful because it allows non-React files 
// (like API clients or WebSocket listeners) to trigger toasts globally.
export function triggerNotification(payload: Omit<AppNotification, 'id'>) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('add-notification', { detail: payload }));
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    // Standard notification handler
    const handleAdd = (event: Event) => {
      const customEvent = event as CustomEvent<Omit<AppNotification, 'id'>>;
      const newNotif = { ...customEvent.detail, id: Math.random().toString(36).substring(2, 11) };
      setNotifications((prev) => [...prev, newNotif]);
    };

    // Specific handler to catch the global-toast event from our centralized API client
    const handleApiToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ type: string, message: string, status: number }>;
      const newNotif: AppNotification = {
        id: Math.random().toString(36).substring(2, 11),
        type: 'error',
        title: `API Error (${customEvent.detail.status})`,
        message: customEvent.detail.message,
      };
      setNotifications((prev) => [...prev, newNotif]);
    };

    window.addEventListener('add-notification', handleAdd);
    window.addEventListener('global-toast', handleApiToast);
    
    return () => {
      window.removeEventListener('add-notification', handleAdd);
      window.removeEventListener('global-toast', handleApiToast);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, removeNotification, showNotification: triggerNotification };
}
