// components/shop/RejectOrderDialog.tsx
import React, { useState } from 'react';
import { Order } from '@/types/order';
import { AlertTriangle, X } from 'lucide-react';

interface RejectOrderDialogProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirmReject: (orderId: number, reason?: string) => Promise<void> | void;
  isLoading?: boolean;
}

export function RejectOrderDialog({
  isOpen,
  order,
  onClose,
  onConfirmReject,
  isLoading = false,
}: RejectOrderDialogProps) {
  const [reason, setReason] = useState('Item out of stock');

  if (!isOpen || !order) return null;

  const handleConfirm = async () => {
    await onConfirmReject(order.id, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Warning Icon & Header */}
        <div className="flex items-start justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reject this order?</h3>
              <p className="text-xs text-slate-500">Order #{order.id} · ₹{order.totalAmount}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <div className="py-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            This action cannot be easily undone. The customer will be notified that the order was cancelled.
          </p>

          {/* Reason Selection */}
          <div className="mt-4 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reason for Rejection
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="Item out of stock">Item out of stock</option>
              <option value="Store too busy">Store too busy / High demand</option>
              <option value="Store closing soon">Store closing soon</option>
              <option value="Unable to fulfill">Unable to fulfill items</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-slate-100 flex gap-2.5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs text-center flex items-center justify-center gap-1"
          >
            {isLoading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}
