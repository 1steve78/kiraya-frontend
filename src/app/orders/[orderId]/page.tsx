// app/orders/[orderId]/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Phone,
  Bell,
  Settings,
  Home,
  Search,
  ShoppingBag,
  User,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ordersApi } from '@/lib/api/orders';
import { useOrderUpdates } from '@/hooks/useOrderUpdates';
import { Order } from '@/types/order';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { OrderItems } from '@/components/orders/OrderItems';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = Number(params.orderId);

  // REST State
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restLastUpdated, setRestLastUpdated] = useState<Date>(new Date());

  // Function to fetch (or resynchronize) the order via REST
  const fetchOrder = useCallback(async () => {
    try {
      const data = await ordersApi.getOrder(orderId);
      setOrder(data);
      setRestLastUpdated(new Date());
      setError(null);
    } catch {
      setError('Couldn’t load your order. Please make sure the backend service is running.');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Initial Data Fetch
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await ordersApi.getOrder(orderId);
        if (!ignore) {
          setOrder(data);
          setRestLastUpdated(new Date());
          setError(null);
        }
      } catch {
        if (!ignore) {
          setError('Couldn’t load your order. Please make sure the backend service is running.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [orderId]);

  // WebSocket Hook
  const { connectionState, liveStatus, lastUpdated: wsLastUpdated } = useOrderUpdates(
    orderId,
    fetchOrder
  );

  const displayStatus = liveStatus || order?.status || 'PENDING';
  const lastUpdated = liveStatus ? wsLastUpdated : restLastUpdated;

  // Early loading / error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-[#006e2f] rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Loading Order #{orderId}...</h2>
        <p className="text-sm text-slate-500 mt-1">Connecting to live tracking...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-sm text-slate-600 max-w-md mb-6">{error || 'Order data is currently unavailable.'}</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIsLoading(true);
              void fetchOrder();
            }}
            className="flex items-center gap-2 bg-[#006e2f] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Estimated Arrival calculation based on status
  const etaDisplay =
    displayStatus === 'DELIVERED'
      ? { value: '0', unit: 'min', text: 'Delivered successfully' }
      : displayStatus === 'CANCELLED'
      ? { value: '--', unit: '', text: 'Order was cancelled' }
      : displayStatus === 'OUT_FOR_DELIVERY'
      ? { value: '12', unit: 'min', text: 'Arriving today at your location' }
      : displayStatus === 'PREPARING'
      ? { value: '25', unit: 'min', text: 'Packing fresh items' }
      : { value: '35', unit: 'min', text: 'Estimated arrival time' };

  // Connection Indicator Details
  const connectionDetails = {
    CONNECTING: { color: 'bg-amber-400', text: 'Connecting live updates...' },
    CONNECTED: { color: 'bg-emerald-500', text: 'Live WebSocket connected' },
    RECONNECTING: { color: 'bg-amber-400', text: 'Reconnecting to live updates...' },
    DISCONNECTED: { color: 'bg-red-400', text: 'Live updates offline' },
  }[connectionState];

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen flex flex-col antialiased">
      {/* TopNavBar (Desktop) */}
      <header className="hidden md:flex justify-between items-center w-full px-6 lg:px-16 h-16 bg-white shadow-xs sticky top-0 z-50 border-b border-slate-200/80">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-extrabold text-2xl text-[#006e2f] tracking-tight">
            HyperLocal
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href={`/orders/${order.id}`}
              className="text-[#006e2f] font-bold border-b-2 border-[#006e2f] px-3 py-1.5 text-sm transition-colors"
            >
              Orders
            </Link>
            <a
              href="#support"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Support
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            aria-label="Settings"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button className="ml-2 text-sm font-semibold text-[#006e2f] hover:bg-emerald-50 px-4 py-2 rounded-full border border-[#006e2f] active:scale-95 transition-all">
            Profile
          </button>
        </div>
      </header>

      {/* TopNavBar (Mobile) */}
      <div className="md:hidden h-16 flex items-center justify-between px-4 bg-white shadow-xs sticky top-0 z-40 border-b border-slate-200">
        <Link href="/" className="font-extrabold text-xl text-[#006e2f] tracking-tight">
          HyperLocal
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Order #{order.id}
        </span>
      </div>

      {/* Main Content */}
      <main className="flex-grow pt-6 md:pt-8 pb-32 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto w-full">
        {/* Title Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Order #{order.id}
            </h1>
            <p className="text-sm md:text-base text-slate-500 mt-1">{etaDisplay.text}</p>
          </div>

          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs self-start sm:self-auto text-xs font-medium text-slate-700">
            <span className={`w-2 h-2 rounded-full ${connectionDetails.color}`} />
            <span>{connectionDetails.text}</span>
            <span className="text-slate-400">· {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column (Col 7): ETA, Map, Delivery Driver */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* ETA Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Estimated Arrival
                </p>
                <div className="text-4xl lg:text-5xl font-extrabold text-[#22c55e] flex items-baseline gap-2">
                  <span>{etaDisplay.value}</span>
                  {etaDisplay.unit && (
                    <span className="text-xl lg:text-2xl font-bold text-slate-900">
                      {etaDisplay.unit}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-[#22c55e]">
                <Clock className="w-8 h-8 text-[#22c55e]" />
              </div>
            </div>

            {/* Map Visualization */}
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden h-[300px] md:h-[400px] relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyuX6tscy23plZob0sGA9YmEyT9j1ttBdtaKzMlYzQn3UvwfrGEyVrbBpfu2Yuel0fSZJSzCyp044I58KAwdZ4wWWJ7wUOy1DA9YPTkxhhzCY5QeF-HvWAEjE_LlF9ivs9grcUEmCYKUw8oOhWc6efevUr6U90JCE5bD0JE4-29_Q_lTeTCvw_ClWPdCRdSeK5B7C_XqBwd6XqCdHFOalhjiWRi1pLLXJy8WDcagMf0tCzqOBY1L63hg"
                alt="Delivery live route map"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
              {/* Map Overlay Chip */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                <span className="text-xs font-bold text-slate-900">{order.shopName}</span>
              </div>
            </div>

            {/* Delivery Partner */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 shrink-0 relative">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXMKGblyhNmD5A_3TS_49f6NwwzVE8gZYrMGuonI4Pdx_j4QMK3dOtozz7fJ7kdcMH8nxt2vQchNekkZvWbAFgXSNf_6Y8A23iNaPAbVUhITlHXxB2oZ53pSsuk2qYyiw76mZIbwBCIXJ2ZeDQS7DM6KFaQdCLsAIhIPoAER4CDfZp0Qfnmjrubbs-3D95qPgUHM6RZrfE4s2pQDK052BptKPgjw8kUffmzCBpcOttL-ACPKgQnmPh9Q"
                  alt="Delivery partner Rahul S."
                  fill
                  className="object-cover"
                  sizes="56px"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#22c55e] rounded-full border-2 border-white" />
              </div>
              <div className="flex-grow">
                <p className="text-base md:text-lg font-bold text-slate-900">Rahul S.</p>
                <p className="text-xs md:text-sm text-slate-500">Delivery partner is on the way</p>
              </div>
              <a
                href="tel:+919876543210"
                className="w-11 h-11 rounded-full bg-emerald-50 text-[#006e2f] flex items-center justify-center hover:bg-emerald-100 transition-colors shrink-0 shadow-xs active:scale-95"
                aria-label="Call delivery partner"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Column (Col 5): Live Status & Order Summary */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Status Card */}
            <OrderTimeline currentStatus={displayStatus} updatedAt={order.updatedAt} />

            {/* Order Summary */}
            <OrderItems
              shopName={order.shopName}
              items={order.items}
              totalAmount={order.totalAmount}
            />
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 bg-white shadow-lg rounded-t-2xl border-t border-slate-200">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-90 transition-transform p-2 rounded-lg w-16"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium">Home</span>
        </Link>
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-90 transition-transform p-2 rounded-lg w-16"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium">Search</span>
        </Link>
        <div className="flex flex-col items-center justify-center bg-[#22c55e] text-white rounded-full px-4 py-1.5 active:scale-90 transition-transform w-20 shadow-xs">
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">Orders</span>
        </div>
        <button className="flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-90 transition-transform p-2 rounded-lg w-16">
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium">Account</span>
        </button>
      </nav>
    </div>
  );
}
