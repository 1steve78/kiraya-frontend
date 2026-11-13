// app/orders/[orderId]/page.tsx
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Clock,
  Bell,
  Settings,
  Home,
  Search,
  ShoppingBag,
  User,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ordersApi } from '@/lib/api/orders';
import { useOrderUpdates } from '@/hooks/useOrderUpdates';
import { useDeliveryTracking } from '@/hooks/useDeliveryTracking';
import { Order } from '@/types/order';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { OrderItems } from '@/components/orders/OrderItems';
import { DeliveryInfoPanel } from '@/components/tracking/DeliveryInfoPanel';

// Dynamically load Mapbox GL component with SSR disabled
const DeliveryMap = dynamic(
  () => import('@/components/tracking/DeliveryMap').then((mod) => mod.DeliveryMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[360px] md:h-[440px] rounded-3xl bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200">
        <div className="w-9 h-9 border-3 border-emerald-300 border-t-[#006e2f] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-600">Initializing Live Moving Map...</span>
      </div>
    ),
  }
);

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

  // WebSocket Hook for Order Status
  const { connectionState, liveStatus, lastUpdated: wsLastUpdated } = useOrderUpdates(
    orderId,
    fetchOrder
  );

  // WebSocket Hook for Delivery Partner Live GPS Tracking & Dynamic ETA
  const {
    coordinates: deliveryCoords,
    lastUpdated: locationLastUpdated,
    isTracking: isLocationTracking,
    etaMinutes,
    estimatedArrival,
    etaLastUpdated,
    isEtaStale,
  } = useDeliveryTracking(orderId, {
    onResync: fetchOrder,
  });

  const displayStatus = liveStatus || order?.status || 'PENDING';
  const lastUpdated = liveStatus ? wsLastUpdated : (locationLastUpdated || restLastUpdated);

  // Delivery Coordinates setup (Pickup & Destination matching simulator defaults)
  const pickupLocation = useMemo(
    () => ({
      lat: 12.9716,
      lng: 77.5946,
      name: order?.shopName || 'Fresh Mart',
      address: 'Indiranagar 100ft Road, Bengaluru',
    }),
    [order?.shopName]
  );

  const destinationLocation = useMemo(
    () => ({
      lat: 12.9785,
      lng: 77.6060,
      name: order?.customerName || 'Your Location',
      address: 'Koramangala 4th Block, Bengaluru',
    }),
    [order?.customerName]
  );

  const partnerInfo = useMemo(
    () => ({
      name: 'Rahul S.',
      phone: '+919876543210',
      vehicle: 'Honda Activa',
    }),
    []
  );

  // Formatted arrival time string (e.g., "12:30 PM")
  const formattedArrivalTime = useMemo(() => {
    if (!estimatedArrival) return null;
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(estimatedArrival);
    } catch {
      return null;
    }
  }, [estimatedArrival]);

  // Dynamic ETA display configuration matching Day 32 requirements
  const etaDisplay = useMemo(() => {
    if (displayStatus === 'DELIVERED') {
      return {
        value: '0',
        unit: 'min',
        headerText: 'Your order was delivered successfully',
        subtitle: 'Package dropped off at your doorstep',
        badge: 'Delivered',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    }

    if (displayStatus === 'CANCELLED') {
      return {
        value: '--',
        unit: '',
        headerText: 'Your order was cancelled',
        subtitle: 'Contact support if you need assistance',
        badge: 'Cancelled',
        badgeColor: 'bg-red-50 text-red-600 border-red-200',
      };
    }

    if (etaMinutes !== null && etaMinutes !== undefined) {
      const timeStr = formattedArrivalTime
        ? `Estimated arrival: ${formattedArrivalTime}`
        : 'Delivery partner is approaching';
      return {
        value: String(etaMinutes),
        unit: etaMinutes === 1 ? 'minute' : 'minutes',
        headerText: 'Your order is on the way · Live tracking',
        subtitle: timeStr,
        badge: isEtaStale ? 'Estimate (Stale)' : 'Live ETA',
        badgeColor: isEtaStale
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    }

    // Default status-based fallback while waiting for initial ETA computation
    const fallbackMins =
      displayStatus === 'OUT_FOR_DELIVERY'
        ? 12
        : displayStatus === 'PICKED_UP'
        ? 15
        : displayStatus === 'PREPARING'
        ? 25
        : 35;

    return {
      value: String(fallbackMins),
      unit: 'minutes',
      headerText: 'Your order is being processed',
      subtitle: 'Delivery partner is approaching · ETA updates automatically',
      badge: 'Calculating...',
      badgeColor: 'bg-slate-50 text-slate-600 border-slate-200',
    };
  }, [displayStatus, etaMinutes, formattedArrivalTime, isEtaStale]);

  // Connection Indicator Details
  const connectionDetails = {
    CONNECTING: { color: 'bg-amber-400', text: 'Connecting live updates...' },
    CONNECTED: { color: 'bg-emerald-500', text: 'Live WebSocket connected' },
    RECONNECTING: { color: 'bg-amber-400', text: 'Reconnecting to live updates...' },
    DISCONNECTED: { color: 'bg-red-400', text: 'Live updates offline' },
  }[connectionState];

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
            <p className="text-sm md:text-base text-slate-500 mt-1">{etaDisplay.headerText}</p>
          </div>

          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs self-start sm:self-auto text-xs font-medium text-slate-700">
            <span className={`w-2 h-2 rounded-full ${connectionDetails.color}`} />
            <span>{connectionDetails.text}</span>
            <span className="text-slate-400">· {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column (Col 7): Dynamic ETA, Live Mapbox Map, Delivery Info Panel */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Dynamic ETA Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Estimated Arrival
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${etaDisplay.badgeColor}`}
                  >
                    {!isEtaStale && displayStatus !== 'DELIVERED' && displayStatus !== 'CANCELLED' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    {etaDisplay.badge}
                  </span>
                </div>
                <div className="text-4xl lg:text-5xl font-extrabold text-[#006e2f] flex items-baseline gap-2">
                  <span>{etaDisplay.value}</span>
                  {etaDisplay.unit && (
                    <span className="text-xl lg:text-2xl font-bold text-slate-900">
                      {etaDisplay.unit}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1.5 text-xs text-slate-500">
                  <p className="font-medium text-slate-700">{etaDisplay.subtitle}</p>
                  {etaLastUpdated && displayStatus !== 'DELIVERED' && (
                    <span className="hidden sm:inline text-slate-300">·</span>
                  )}
                  {etaLastUpdated && displayStatus !== 'DELIVERED' && (
                    <span className="text-[11px] text-slate-400">
                      ETA updates automatically
                    </span>
                  )}
                </div>
              </div>
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#006e2f] shrink-0 self-start sm:self-auto shadow-xs border border-emerald-100">
                <Clock className="w-8 h-8 text-[#006e2f]" />
              </div>
            </div>

            {/* Live Mapbox Moving Map */}
            <DeliveryMap
              deliveryId={order.id}
              pickup={pickupLocation}
              destination={destinationLocation}
              partnerInfo={partnerInfo}
              partnerLocation={
                deliveryCoords
                  ? {
                      lat: deliveryCoords.lat,
                      lng: deliveryCoords.lng,
                      timestamp: locationLastUpdated || Date.now(),
                    }
                  : null
              }
              status={displayStatus}
              connectionState={connectionState}
              className="h-[360px] md:h-[440px]"
            />

            {/* Delivery Information Panel */}
            <DeliveryInfoPanel
              status={displayStatus}
              pickup={pickupLocation}
              destination={destinationLocation}
              partnerInfo={partnerInfo}
              isLiveTracking={isLocationTracking}
            />
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
