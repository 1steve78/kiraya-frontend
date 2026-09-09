// components/shop/ShopOrderBoard.tsx
import React from 'react';
import { Order } from '@/types/order';
import { ShopOrderColumn } from './ShopOrderColumn';

interface ShopOrderBoardProps {
  orders: Order[];
  activeFilter: 'ALL' | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP';
  onViewOrder: (order: Order) => void;
  onConfirm: (orderId: number) => void;
  onStartPreparing: (orderId: number) => void;
  onMarkReady: (orderId: number) => void;
  onReject: (orderId: number) => void;
  onHandOver?: (orderId: number) => void;
}

export function ShopOrderBoard({
  orders,
  activeFilter,
  onViewOrder,
  onConfirm,
  onStartPreparing,
  onMarkReady,
  onReject,
  onHandOver,
}: ShopOrderBoardProps) {
  // Group orders by operational order state
  const newOrders = orders.filter((o) => o.status === 'PENDING');
  const confirmedOrders = orders.filter((o) => o.status === 'CONFIRMED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY_FOR_PICKUP');

  // Determine grid columns based on active filter
  const isAll = activeFilter === 'ALL';
  const gridClasses = isAll
    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start'
    : 'grid grid-cols-1 max-w-2xl mx-auto gap-6';

  return (
    <div className={gridClasses}>
      {/* 1. NEW ORDERS COLUMN */}
      {(activeFilter === 'ALL' || activeFilter === 'PENDING') && (
        <ShopOrderColumn
          title="New Orders"
          count={newOrders.length}
          badgeStyle={{
            bg: 'bg-amber-100',
            text: 'text-amber-800',
            dot: 'bg-amber-500',
            pulse: true,
          }}
          orders={newOrders}
          emptyMessage="No new incoming orders"
          onViewOrder={onViewOrder}
          onConfirm={onConfirm}
          onStartPreparing={onStartPreparing}
          onReject={onReject}
        />
      )}

      {/* 2. CONFIRMED COLUMN */}
      {(activeFilter === 'ALL' || activeFilter === 'CONFIRMED') && (
        <ShopOrderColumn
          title="Confirmed"
          count={confirmedOrders.length}
          badgeStyle={{
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            dot: 'bg-blue-500',
          }}
          orders={confirmedOrders}
          emptyMessage="No confirmed orders waiting"
          onViewOrder={onViewOrder}
          onStartPreparing={onStartPreparing}
          onReject={onReject}
        />
      )}

      {/* 3. PREPARING COLUMN */}
      {(activeFilter === 'ALL' || activeFilter === 'PREPARING') && (
        <ShopOrderColumn
          title="Preparing"
          count={preparingOrders.length}
          badgeStyle={{
            bg: 'bg-purple-100',
            text: 'text-purple-800',
            dot: 'bg-purple-500',
          }}
          orders={preparingOrders}
          emptyMessage="No orders currently being prepared"
          onViewOrder={onViewOrder}
          onMarkReady={onMarkReady}
          onReject={onReject}
        />
      )}

      {/* 4. READY FOR PICKUP COLUMN */}
      {(activeFilter === 'ALL' || activeFilter === 'READY_FOR_PICKUP') && (
        <ShopOrderColumn
          title="Ready for Pickup"
          count={readyOrders.length}
          badgeStyle={{
            bg: 'bg-emerald-100',
            text: 'text-[#004b1e]',
            dot: 'bg-[#22c55e]',
          }}
          orders={readyOrders}
          emptyMessage="No orders ready for pickup"
          onViewOrder={onViewOrder}
          onHandOver={onHandOver}
        />
      )}
    </div>
  );
}
