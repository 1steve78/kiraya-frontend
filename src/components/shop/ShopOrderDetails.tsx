// components/shop/ShopOrderDetails.tsx
import React from 'react';
import { Order } from '@/types/order';
import { X, Play, CheckCircle2, Ban, Clock, Phone, User as UserIcon } from 'lucide-react';

interface ShopOrderDetailsProps {
  order: Order | null;
  onClose: () => void;
  onConfirm?: (orderId: number) => void;
  onStartPreparing?: (orderId: number) => void;
  onMarkReady?: (orderId: number) => void;
  onReject?: (orderId: number) => void;
  onHandOver?: (orderId: number) => void;
}

export function ShopOrderDetails({
  order,
  onClose,
  onConfirm,
  onStartPreparing,
  onMarkReady,
  onReject,
}: ShopOrderDetailsProps) {
  if (!order) return null;

  const customerName = order.customerName || `Customer #${order.customerId}`;
  const customerPhone = order.customerPhone || '+91 98765 43210';

  const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'bg-amber-100', text: 'text-amber-800' },
    CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800' },
    PREPARING: { bg: 'bg-purple-100', text: 'text-purple-800' },
    READY_FOR_PICKUP: { bg: 'bg-emerald-100', text: 'text-[#004b1e]' },
    OUT_FOR_DELIVERY: { bg: 'bg-slate-100', text: 'text-slate-800' },
    DELIVERED: { bg: 'bg-green-100', text: 'text-green-800' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  const currentStatusStyle = statusColors[order.status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order #{order.id}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Section */}
        <div className="py-4 border-b border-slate-200 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</h3>
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <UserIcon className="w-4 h-4 text-slate-500" />
            <span>{customerName}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{customerPhone}</span>
          </div>
        </div>

        {/* Items Section */}
        <div className="py-4 border-b border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items</h3>
          <div className="space-y-2.5">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm font-medium text-slate-800">
                <span>
                  <strong className="text-slate-900 font-bold">{item.quantity} ×</strong> {item.productName}
                </span>
                <span className="font-extrabold text-slate-900">₹{item.subtotal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Status Section */}
        <div className="py-4 border-b border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-600">Total</span>
            <span className="text-2xl font-extrabold text-[#006e2f]">₹{order.totalAmount}</span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${currentStatusStyle.bg} ${currentStatusStyle.text}`}
            >
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-2">
          <div className="flex gap-2">
            {order.status === 'PENDING' && (
              <>
                <button
                  onClick={() => (onStartPreparing ? onStartPreparing(order.id) : onConfirm?.(order.id))}
                  className="flex-1 py-3 px-4 bg-[#006e2f] hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Preparing</span>
                </button>
                <button
                  onClick={() => onReject?.(order.id)}
                  className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-all border border-red-200 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {order.status === 'CONFIRMED' && (
              <>
                <button
                  onClick={() => onStartPreparing?.(order.id)}
                  className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Preparing</span>
                </button>
                <button
                  onClick={() => onReject?.(order.id)}
                  className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-all border border-red-200 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {order.status === 'PREPARING' && (
              <>
                <button
                  onClick={() => onMarkReady?.(order.id)}
                  className="flex-1 py-3 px-4 bg-[#006e2f] hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Ready</span>
                </button>
                <button
                  onClick={() => onReject?.(order.id)}
                  className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-all border border-red-200 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {order.status === 'READY_FOR_PICKUP' && (
              <div className="w-full py-3 px-4 bg-emerald-50 border border-emerald-200/80 text-[#004b1e] text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-[#006e2f]" />
                <span>Waiting for delivery partner</span>
              </div>
            )}

            {order.status === 'CANCELLED' && (
              <div className="w-full py-2.5 text-center text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-100">
                This order was cancelled
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors mt-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
