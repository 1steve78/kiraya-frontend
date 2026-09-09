// components/shop/ShopOrderColumn.tsx
import React from 'react';
import { Order } from '@/types/order';
import { ShopOrderCard } from './ShopOrderCard';

interface ShopOrderColumnProps {
  title: string;
  count: number;
  badgeStyle: {
    bg: string;
    text: string;
    dot: string;
    pulse?: boolean;
  };
  orders: Order[];
  emptyMessage?: string;
  onViewOrder: (order: Order) => void;
  onConfirm?: (orderId: number) => void;
  onStartPreparing?: (orderId: number) => void;
  onMarkReady?: (orderId: number) => void;
  onReject?: (orderId: number) => void;
  onHandOver?: (orderId: number) => void;
}

export function ShopOrderColumn({
  title,
  count,
  badgeStyle,
  orders,
  emptyMessage = 'No orders in this state',
  onViewOrder,
  onConfirm,
  onStartPreparing,
  onMarkReady,
  onReject,
  onHandOver,
}: ShopOrderColumnProps) {
  return (
    <section className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${badgeStyle.dot} ${
              badgeStyle.pulse ? 'animate-pulse' : ''
            }`}
          />
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
            {title}
          </h2>
        </div>
        <span
          className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${badgeStyle.bg} ${badgeStyle.text}`}
        >
          {count} {count === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {/* Orders List / Empty State */}
      {orders.length === 0 ? (
        <div className="py-12 text-center text-xs sm:text-sm text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 flex-1 flex items-center justify-center">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3.5 flex-1 overflow-y-auto pr-0.5">
          {orders.map((order) => (
            <ShopOrderCard
              key={order.id}
              order={order}
              onViewOrder={onViewOrder}
              onConfirm={onConfirm}
              onStartPreparing={onStartPreparing}
              onMarkReady={onMarkReady}
              onReject={onReject}
              onHandOver={onHandOver}
            />
          ))}
        </div>
      )}
    </section>
  );
}
