// components/shop/NewOrderToast.tsx
import React, { useEffect } from 'react';
import { Bell, X, ArrowRight } from 'lucide-react';

export interface NewOrderNotificationData {
  orderId: number;
  totalAmount?: number;
  itemCount?: number;
  customerName?: string;
}

interface NewOrderToastProps {
  notification: NewOrderNotificationData | null;
  onViewOrder: (orderId: number) => void;
  onDismiss: () => void;
}

export function NewOrderToast({
  notification,
  onViewOrder,
  onDismiss,
}: NewOrderToastProps) {
  // Auto-dismiss after 12 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 12000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border-2 border-[#22c55e] relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center animate-bounce">
              <Bell className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#22c55e]">
              New Order
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-3 space-y-1">
          <h4 className="text-xl font-extrabold tracking-tight text-white">
            Order #{notification.orderId}
          </h4>
          <p className="text-sm font-semibold text-slate-300">
            {notification.totalAmount !== undefined && `₹${notification.totalAmount}`}
            {notification.itemCount !== undefined && ` • ${notification.itemCount} items`}
            {notification.customerName && ` (${notification.customerName})`}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              onViewOrder(notification.orderId);
              onDismiss();
            }}
            className="w-full py-2.5 px-4 bg-[#22c55e] hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <span>View Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
