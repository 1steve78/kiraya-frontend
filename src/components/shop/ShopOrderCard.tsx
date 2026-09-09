// components/shop/ShopOrderCard.tsx
import React from 'react';
import { Order } from '@/types/order';
import { CheckCircle2, Play, Clock, Ban } from 'lucide-react';

interface ShopOrderCardProps {
  order: Order;
  onViewOrder: (order: Order) => void;
  onConfirm?: (orderId: number) => void;
  onStartPreparing?: (orderId: number) => void;
  onMarkReady?: (orderId: number) => void;
  onReject?: (orderId: number) => void;
  onHandOver?: (orderId: number) => void;
  isActionLoading?: boolean;
}

export function ShopOrderCard({
  order,
  onViewOrder,
  onConfirm,
  onStartPreparing,
  onMarkReady,
  onReject,
  isActionLoading = false,
}: ShopOrderCardProps) {
  const customerName = order.customerName || `Customer #${order.customerId}`;

  // Status visual styles
  const statusStyles: Record<string, { bg: string; text: string; label: string; dot: string }> = {
    PENDING: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'NEW', dot: 'bg-amber-500' },
    CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'CONFIRMED', dot: 'bg-blue-500' },
    PREPARING: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'PREPARING', dot: 'bg-purple-500' },
    READY_FOR_PICKUP: { bg: 'bg-emerald-100', text: 'text-[#004b1e]', label: 'READY', dot: 'bg-[#22c55e]' },
    OUT_FOR_DELIVERY: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'OUT FOR DELIVERY', dot: 'bg-slate-600' },
    DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', label: 'DELIVERED', dot: 'bg-green-600' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'CANCELLED', dot: 'bg-red-600' },
  };

  const statusConfig = statusStyles[order.status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    label: order.status,
    dot: 'bg-slate-400',
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 animate-in fade-in zoom-in-95 flex flex-col justify-between">
      {/* Top Header: Order Number & Status Badge */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-lg font-extrabold text-slate-900 tracking-tight">Order #{order.id}</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>

        {/* Order Items List */}
        <div className="py-3 space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="text-sm font-medium text-slate-700 flex justify-between items-baseline">
              <span>
                <strong className="text-slate-900 font-semibold">{item.quantity} ×</strong> {item.productName}
              </span>
            </div>
          ))}
        </div>

        {/* Customer & Total Info */}
        <div className="pt-2 pb-3 border-t border-slate-100 space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Customer:</span>
            <span className="font-bold text-slate-800">{customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Total:</span>
            <span className="text-base font-extrabold text-[#006e2f]">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer (Organized around order states) */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewOrder(order)}
            className="flex-1 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-xs text-center"
          >
            View Order
          </button>

          {/* New Orders: [Confirm] / [Start Preparing] */}
          {order.status === 'PENDING' && (
            <button
              onClick={() => (onStartPreparing ? onStartPreparing(order.id) : onConfirm?.(order.id))}
              disabled={isActionLoading}
              className="flex-1 py-2 px-3 bg-[#006e2f] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1 text-center"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Preparing</span>
            </button>
          )}

          {/* Confirmed Orders: [Start Preparing] */}
          {order.status === 'CONFIRMED' && (
            <button
              onClick={() => onStartPreparing?.(order.id)}
              disabled={isActionLoading}
              className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1 text-center"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Preparing</span>
            </button>
          )}

          {/* Preparing Orders: [Mark Ready] */}
          {order.status === 'PREPARING' && (
            <button
              onClick={() => onMarkReady?.(order.id)}
              disabled={isActionLoading}
              className="flex-1 py-2 px-3 bg-[#006e2f] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1 text-center"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Ready</span>
            </button>
          )}

          {/* Ready Orders: Waiting for delivery partner */}
          {order.status === 'READY_FOR_PICKUP' && (
            <div className="flex-1 py-2 px-3 bg-emerald-50 border border-emerald-200/80 text-[#004b1e] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 text-center">
              <Clock className="w-3.5 h-3.5 text-[#006e2f]" />
              <span>Waiting for delivery partner</span>
            </div>
          )}
        </div>

        {/* Destructive Action [Reject Order] with Confirmation Trigger */}
        {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PREPARING') && onReject && (
          <div className="flex justify-end">
            <button
              onClick={() => onReject(order.id)}
              disabled={isActionLoading}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 pt-1"
            >
              <Ban className="w-3 h-3" />
              <span>Reject Order</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
