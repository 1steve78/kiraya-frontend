'use client';
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell, Package, MapPin } from 'lucide-react';
import { AppNotification } from '@/hooks/useNotifications';

interface Props {
  notification: AppNotification;
  onClose: (id: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  delivery: <MapPin className="w-5 h-5 text-purple-500" />,
  order: <Package className="w-5 h-5 text-indigo-500" />
};

export function Notification({ notification, onClose }: Props) {
  useEffect(() => {
    // Default duration is 5000ms unless explicitly set to 0 (which means stick around)
    const duration = notification.duration !== undefined ? notification.duration : 5000;
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const Icon = iconMap[notification.type] || iconMap.info;

  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-lg border border-slate-100 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">{Icon}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-slate-900">{notification.title}</p>
            {notification.message && (
              <p className="mt-1 text-sm text-slate-500">{notification.message}</p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              onClick={() => onClose(notification.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
