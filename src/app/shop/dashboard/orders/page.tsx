'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import {
  Store,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ArrowRight,
  PlusCircle,
  Clock,
  AlertTriangle,
  Lock,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { NewOrderEvent, OrderStatusChangedEvent, OrderCancelledEvent } from '@/types/realtime';
import { shopApi } from '@/lib/api/shop';
import { useShopOrderUpdates } from '@/hooks/useShopOrderUpdates';
import { useAuth } from '@/hooks/useAuth';
import { ShopOrderBoard } from '@/components/shop/ShopOrderBoard';
import { ShopOrderDetails } from '@/components/shop/ShopOrderDetails';
import { RejectOrderDialog } from '@/components/shop/RejectOrderDialog';
import { NewOrderToast, NewOrderNotificationData } from '@/components/shop/NewOrderToast';
import { ShopOrderSkeleton } from '@/components/shop/ShopOrderSkeleton';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { EmptyState } from '@/components/common/EmptyState';


/**
 * Deduplication Utility:
 * Merges incoming orders into the existing list using order.id as primary key.
 */
function upsertOrders(existing: Order[], incoming: Order | Order[]): Order[] {
  const map = new Map<number, Order>();
  for (const order of existing) {
    map.set(order.id, order);
  }

  const incomingList = Array.isArray(incoming) ? incoming : [incoming];
  for (const order of incomingList) {
    const prev = map.get(order.id);
    map.set(order.id, prev ? { ...prev, ...order } : order);
  }

  return Array.from(map.values());
}

/**
 * Helper to format relative time for "Last Updated"
 */
function formatRelativeTime(date: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return date.toLocaleTimeString();
}

function ShopDashboardContent() {
  // Read shopId from the JWT token — supports any shop owner, not just shopId=1
  const SHOP_ID = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 1;
      const decoded: any = jwtDecode(token);
      return decoded.shopId ?? 1;
    } catch {
      return 1;
    }
  })();

  // 22. Authorization Check (Frontend Authorization controls the interface)
  const { user, isAuthorizedForShop, switchRole } = useAuth();
  const isAuthorized = isAuthorizedForShop(SHOP_ID);

  // 15. Dashboard State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP'>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newOrderNotification, setNewOrderNotification] = useState<NewOrderNotificationData | null>(null);

  // Periodic tick to refresh relative time string
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  // 12 & 21. REST Snapshot Fetch with Error Recovery
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await shopApi.getShopOrders(SHOP_ID);
      if (Array.isArray(data)) {
        setOrders(data);
      }
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Couldn't load orders.";
      // If 403 Forbidden is returned by backend
      if (message.includes('403') || message.includes('Forbidden')) {
        setFetchError('403 Forbidden: You are not authorized to view orders for this shop.');
      } else {
        setFetchError("Couldn't load orders. Please make sure the backend service is running.");
      }
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [SHOP_ID]);

  // Initial Data Fetch on Mount
  useEffect(() => {
    if (isAuthorized) {
      void fetchOrders();
    }
  }, [fetchOrders, isAuthorized]);

  // 13. WebSocket Event Handlers with Deduplication
  const handleNewOrderEvent = useCallback((event: NewOrderEvent) => {
    const orderId = event.data.orderId;
    const newOrderData: Order = event.data.order || {
      id: orderId,
      shopId: event.data.shopId || SHOP_ID,
      shopName: 'Fresh Mart',
      customerId: 211,
      customerName: 'Priya Mukherjee',
      customerPhone: '+91 98222 33344',
      status: 'PENDING',
      totalAmount: event.data.totalAmount || 420,
      items: [
        { id: 101, productId: 1, productName: 'Organic Gala Apples', quantity: 2, unitPrice: 120, subtotal: 240 },
        { id: 102, productId: 2, productName: 'Farm Fresh Eggs (6s)', quantity: 2, unitPrice: 90, subtotal: 180 },
      ],
      createdAt: event.timestamp || new Date().toISOString(),
      updatedAt: event.timestamp || new Date().toISOString(),
    };

    setOrders((prev) => upsertOrders(prev, newOrderData));
    setLastUpdated(new Date());

    const totalItems = newOrderData.items.reduce((acc, i) => acc + i.quantity, 0);
    setNewOrderNotification({
      orderId: newOrderData.id,
      totalAmount: newOrderData.totalAmount,
      itemCount: totalItems,
      customerName: newOrderData.customerName,
    });
  }, [SHOP_ID]);

  const handleStatusChangedEvent = useCallback((event: OrderStatusChangedEvent) => {
    const { orderId, status } = event.data;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: event.timestamp || new Date().toISOString() } : o))
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status, updatedAt: event.timestamp || new Date().toISOString() } : null));
    }
    setLastUpdated(new Date());
  }, [selectedOrder]);

  const handleOrderCancelledEvent = useCallback((event: OrderCancelledEvent) => {
    const { orderId } = event.data;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED', updatedAt: event.timestamp || new Date().toISOString() } : o))
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
    }
    setLastUpdated(new Date());
  }, [selectedOrder]);

  // Real-time WebSocket hook with automatic REST resync on reconnection
  const { connectionState } = useShopOrderUpdates(SHOP_ID, {
    onNewOrder: handleNewOrderEvent,
    onStatusChanged: handleStatusChangedEvent,
    onOrderCancelled: handleOrderCancelledEvent,
    onReconnect: fetchOrders,
  });

  // 18. Derived Dashboard Statistics
  const statistics = useMemo(() => {
    return {
      newCount: orders.filter((o) => o.status === 'PENDING').length,
      confirmedCount: orders.filter((o) => o.status === 'CONFIRMED').length,
      preparingCount: orders.filter((o) => o.status === 'PREPARING').length,
      readyCount: orders.filter((o) => o.status === 'READY_FOR_PICKUP').length,
    };
  }, [orders]);

  // Unified State Machine Transition Interface
  const executeTransition = async (orderId: number, nextStatus: OrderStatus, reason?: string) => {
    const previousOrder = orders.find((o) => o.id === orderId);
    if (!previousOrder) return;

    // Optimistic state update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus, updatedAt: new Date().toISOString() } : o))
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus, updatedAt: new Date().toISOString() } : null));
    }
    setLastUpdated(new Date());

    try {
      await shopApi.updateOrderStatus(orderId, nextStatus, reason);
      setFeedback({
        type: 'success',
        message: `Order #${orderId} moved to ${nextStatus.replace(/_/g, ' ')}`,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid state transition';
      // Rollback optimistic update if backend rejects illegal transition or returns 403
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? previousOrder : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(previousOrder);
      }
      setFeedback({
        type: 'error',
        message: `Backend rejected operation: ${errorMsg}`,
      });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleConfirmOrder = (orderId: number) => {
    void executeTransition(orderId, 'CONFIRMED');
  };

  const handleStartPreparing = (orderId: number) => {
    void executeTransition(orderId, 'PREPARING');
  };

  const handleMarkReady = (orderId: number) => {
    void executeTransition(orderId, 'READY_FOR_PICKUP');
  };

  const handleOpenRejectDialog = (orderId: number) => {
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      setRejectingOrder(target);
    }
  };

  const handleConfirmReject = async (orderId: number, reason?: string) => {
    await executeTransition(orderId, 'CANCELLED', reason);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const handleSimulateNewOrder = () => {
    const mockOrder106: Order = {
      id: 106,
      shopId: SHOP_ID,
      shopName: 'Fresh Mart',
      customerId: 206,
      customerName: 'Priya Mukherjee',
      customerPhone: '+91 98222 33344',
      status: 'PENDING',
      totalAmount: 420,
      items: [
        { id: 21, productId: 7, productName: 'Organic Gala Apples (1kg)', quantity: 1, unitPrice: 160, subtotal: 160 },
        { id: 22, productId: 8, productName: 'Farm Eggs (6 pack)', quantity: 2, unitPrice: 90, subtotal: 180 },
        { id: 23, productId: 9, productName: 'Greek Yogurt (400g)', quantity: 1, unitPrice: 80, subtotal: 80 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    handleNewOrderEvent({
      type: 'NEW_ORDER',
      timestamp: new Date().toISOString(),
      data: {
        orderId: 106,
        order: mockOrder106,
        shopId: SHOP_ID,
        totalAmount: 420,
        itemCount: 4,
      },
    });
  };

  // Connection badge color
  const connectionDetails = {
    CONNECTING: { color: 'bg-amber-400', label: 'Connecting' },
    CONNECTED: { color: 'bg-emerald-500', label: 'Live WebSocket' },
    RECONNECTING: { color: 'bg-amber-400', label: 'Reconnecting' },
    DISCONNECTED: { color: 'bg-slate-400', label: 'Offline' },
  }[connectionState];

  // 22. Authorization Guard Screen (if user role is not authorized)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4 border border-red-200/80 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
          Only authorized shop owners and staff members can access the operational Shop Dashboard. Current role:{' '}
          <span className="font-bold text-slate-900 uppercase">{user.role}</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => switchRole('SHOP_OWNER', 1)}
            className="flex items-center justify-center gap-2 bg-[#006e2f] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to Shop Owner (Demo)</span>
          </button>
          <Link
            href="/"
            className="bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen font-sans antialiased pb-20">
      {/* Realtime New Order Notification Toast */}
      <NewOrderToast
        notification={newOrderNotification}
        onViewOrder={(orderId) => {
          const target = orders.find((o) => o.id === orderId);
          if (target) setSelectedOrder(target);
        }}
        onDismiss={() => setNewOrderNotification(null)}
      />

      {/* Orders Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-extrabold text-slate-900">Order Management</h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${connectionDetails.color}`} />
            <span className="font-semibold">{connectionDetails.label}</span>
            <span className="mx-1 text-slate-300">|</span>
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated: {formatRelativeTime(lastUpdated)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulateNewOrder}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Simulate Order</span>
          </button>
          <button
            onClick={() => void fetchOrders()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#006e2f]' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Operational Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 21. WebSocket Disconnection Warning Banner */}
        {connectionState === 'DISCONNECTED' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs font-semibold text-amber-900 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>🟡 Live updates unavailable. Orders may not update automatically.</span>
            </div>
            <button
              onClick={() => void fetchOrders()}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shrink-0"
            >
              Refresh Now
            </button>
          </div>
        )}

        {/* 21. REST Fetch Error Recovery State */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-red-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-red-900">Couldn&apos;t load orders</p>
                <p className="text-xs text-red-700 mt-0.5">{fetchError}</p>
              </div>
            </div>
            <button
              onClick={() => void fetchOrders()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-sm font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
              feedback.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-[#006e2f] text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-white/80 hover:text-white ml-3">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 20. Loading Skeleton */}
        {isLoading && orders.length === 0 ? (
          <ShopOrderSkeleton />
        ) : (
          <>
            {/* 18. Dashboard Statistics Cards */}
            <section className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {/* 1. New Orders Count */}
                <button
                  onClick={() => setActiveFilter(activeFilter === 'PENDING' ? 'ALL' : 'PENDING')}
                  className={`text-left p-3 rounded-xl transition-all ${
                    activeFilter === 'PENDING' ? 'bg-amber-50 ring-2 ring-amber-400' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">New</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                    {statistics.newCount}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Awaiting confirmation</p>
                </button>

                {/* 2. Confirmed Count */}
                <button
                  onClick={() => setActiveFilter(activeFilter === 'CONFIRMED' ? 'ALL' : 'CONFIRMED')}
                  className={`text-left p-3 md:pl-6 rounded-xl transition-all ${
                    activeFilter === 'CONFIRMED' ? 'bg-blue-50 ring-2 ring-blue-400' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Confirmed</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                    {statistics.confirmedCount}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Ready to prepare</p>
                </button>

                {/* 3. Preparing Count */}
                <button
                  onClick={() => setActiveFilter(activeFilter === 'PREPARING' ? 'ALL' : 'PREPARING')}
                  className={`text-left p-3 md:pl-6 rounded-xl transition-all ${
                    activeFilter === 'PREPARING' ? 'bg-purple-50 ring-2 ring-purple-400' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Preparing</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                    {statistics.preparingCount}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Being packed now</p>
                </button>

                {/* 4. Ready Count */}
                <button
                  onClick={() => setActiveFilter(activeFilter === 'READY_FOR_PICKUP' ? 'ALL' : 'READY_FOR_PICKUP')}
                  className={`text-left p-3 md:pl-6 rounded-xl transition-all ${
                    activeFilter === 'READY_FOR_PICKUP' ? 'bg-emerald-50 ring-2 ring-[#22c55e]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#006e2f] uppercase tracking-wider">Ready</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#006e2f] mt-2">
                    {statistics.readyCount}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Waiting for delivery partner</p>
                </button>
              </div>
            </section>

            {/* Filter Quick Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider mr-1">View:</span>
              {(['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'] as const).map((filter) => {
                const labels = {
                  ALL: 'All Orders',
                  PENDING: `New (${statistics.newCount})`,
                  CONFIRMED: `Confirmed (${statistics.confirmedCount})`,
                  PREPARING: `Preparing (${statistics.preparingCount})`,
                  READY_FOR_PICKUP: `Ready (${statistics.readyCount})`,
                };
                const isSelected = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
            </div>

            {/* 14 & 16. Shop Order Board */}
            {orders.length === 0 ? (
              <div className="mt-8">
                <EmptyState 
                  title="No new orders 🎉"
                  description="You're all caught up for now."
                  icon={<Store className="w-6 h-6" />}
                />
              </div>
            ) : (
              <ShopOrderBoard
                orders={orders}
                activeFilter={activeFilter}
                onViewOrder={(order) => setSelectedOrder(order)}
                onConfirm={handleConfirmOrder}
                onStartPreparing={handleStartPreparing}
                onMarkReady={handleMarkReady}
                onReject={handleOpenRejectDialog}
              />
            )}
          </>
        )}
      </main>

      {/* Order Details Modal */}
      <ShopOrderDetails
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onConfirm={handleConfirmOrder}
        onStartPreparing={handleStartPreparing}
        onMarkReady={handleMarkReady}
        onReject={handleOpenRejectDialog}
      />

      {/* Reject Order Confirmation Dialog */}
      <RejectOrderDialog
        isOpen={Boolean(rejectingOrder)}
        order={rejectingOrder}
        onClose={() => setRejectingOrder(null)}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}

export default function OrdersPage() {
  return <ShopDashboardContent />;
}
