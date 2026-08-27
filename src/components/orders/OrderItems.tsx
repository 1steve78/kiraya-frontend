// components/orders/OrderItems.tsx
import React from 'react';
import { OrderItem } from '@/types/order';
import { ShoppingBag } from 'lucide-react';

interface OrderItemsProps {
  shopName: string;
  items: OrderItem[];
  totalAmount: number;
}

export function OrderItems({ shopName, items, totalAmount }: OrderItemsProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-slate-900">Order Summary</h3>
        <span className="text-xs font-semibold text-[#006e2f] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          {shopName}
        </span>
      </div>

      <ul className="space-y-4 mb-5">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between items-start">
            <div className="flex gap-3.5">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl shrink-0 flex items-center justify-center text-slate-500">
                <ShoppingBag className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">{item.productName}</p>
                <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900">
              ₹{item.subtotal.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-500">Total Paid</span>
          <span className="text-2xl font-extrabold text-slate-900">
            ₹{totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
