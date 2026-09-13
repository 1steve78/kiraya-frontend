'use client';

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { LayoutDashboard, Truck, MapPin, Settings } from 'lucide-react';
import { Delivery } from '@/types/delivery';
import { getAvailableDeliveries, getMyDeliveries, acceptDelivery, markPickedUp, markOutForDelivery, markDelivered } from '@/lib/api/delivery';
import { useDeliveryUpdates } from '@/hooks/useDeliveryUpdates';
import { useDeliveryPresence } from '@/hooks/useDeliveryPresence';
import { DeliveryCard } from '@/components/delivery/DeliveryCard';
import { DeliveryDetails } from '@/components/delivery/DeliveryDetails';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';

// Mock fallback data just in case API fails or is empty initially
const FALLBACK_AVAILABLE: Delivery[] = [
  {
    id: 108,
    orderId: 108,
    shop: { id: 1, name: 'Fresh Mart', address: 'Shop 4, Market Complex, 100ft Road' },
    destination: { address: 'Flat 302, Green Glen Heights, Tower C' },
    status: 'READY_FOR_PICKUP',
    distanceKm: 2.4,
    totalAmount: 1460, // 15% payout -> ~220
  },
  {
    id: 109,
    orderId: 109,
    shop: { id: 2, name: 'Green Grocery', address: 'Sector 5 Central Plaza' },
    destination: { address: 'House #14, Sunrise Enclave 3rd Main' },
    status: 'ASSIGNED',
    distanceKm: 1.8,
    totalAmount: 1200, // 15% payout -> ~180
  }
];

export default function DeliveryDashboardPage() {
  // Hooks for presence and updates
  const { status: presenceStatus, isLoading: isPresenceLoading, goOnline, goOffline } = useDeliveryPresence();
  const { lastEvent, connectionState } = useDeliveryUpdates();
  
  const isOnline = presenceStatus === 'ONLINE' || presenceStatus === 'BUSY';
  
  const [partnerName, setPartnerName] = useState('Partner');
  const [partnerInitials, setPartnerInitials] = useState('HL');
  
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [completedDeliveries, setCompletedDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'NEW_DELIVERY') {
      getAvailableDeliveries().then(deliveries => {
        setAvailableDeliveries(deliveries.length > 0 ? deliveries : FALLBACK_AVAILABLE);
      }).catch(console.error);
    } else if (lastEvent.type === 'DELIVERY_ASSIGNED') {
      setAvailableDeliveries(prev => prev.filter(d => d.id !== lastEvent.data.orderId));
    } else if (lastEvent.type === 'DELIVERY_STATUS_CHANGED') {
      setActiveDelivery(prev => {
        if (prev && prev.id === lastEvent.data.orderId) {
          const newStatus = lastEvent.data.status as any;
          if (newStatus === 'DELIVERED') {
             // Move to completed
             setCompletedDeliveries(c => [{...prev, status: newStatus}, ...c]);
             return null;
          }
          return { ...prev, status: newStatus };
        }
        return prev;
      });
    } else if (lastEvent.type === 'DELIVERY_CANCELLED') {
      setAvailableDeliveries(prev => prev.filter(d => d.id !== lastEvent.data.orderId));
      setActiveDelivery(prev => prev?.id === lastEvent.data.orderId ? null : prev);
    }
  }, [lastEvent]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [available, active] = await Promise.all([
        getAvailableDeliveries().catch(() => FALLBACK_AVAILABLE),
        getMyDeliveries().catch(() => [])
      ]);
      
      const realAvailable = available.length > 0 ? available : FALLBACK_AVAILABLE;
      
      const realActive = active.filter(d => !['DELIVERED', 'CANCELLED'].includes(d.status));
      const realCompleted = active.filter(d => d.status === 'DELIVERED');
      
      setAvailableDeliveries(realAvailable);
      setCompletedDeliveries(realCompleted);
      if (realActive.length > 0) {
        setActiveDelivery(realActive[0]);
      }
    } catch (e) {
      console.error(e);
      setAvailableDeliveries(FALLBACK_AVAILABLE);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken.name) {
          setPartnerName(decodedToken.name);
          const initials = decodedToken.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
          setPartnerInitials(initials || 'HL');
        }
      }
    } catch (err) {
      console.error('Error decoding token:', err);
    }
    
    loadData();
  }, []);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAcceptDelivery = async (deliveryId: number) => {
    setErrorMsg(null);
    try {
      // Real API call
      const accepted = await acceptDelivery(deliveryId);
      
      // Local optimistic update
      const target = availableDeliveries.find(d => d.id === deliveryId);
      if (target) {
        const updatedTarget = { ...target, status: 'ACCEPTED' as const };
        setAvailableDeliveries(prev => prev.filter(d => d.id !== deliveryId));
        setActiveDelivery(updatedTarget);
      }
    } catch (e: any) {
      console.error("Failed to accept delivery", e);
      // apiClient throws an Error with the message from the backend or the status code
      if (e.message && (e.message.includes('409') || e.message.includes('modified by another') || e.message.includes('READY_FOR_PICKUP'))) {
        setErrorMsg("This delivery was already accepted");
        setAvailableDeliveries(prev => prev.filter(d => d.id !== deliveryId));
      } else {
        setErrorMsg("Failed to accept delivery. Please try again.");
      }
    }
  };

  const handleStatusChange = async (deliveryId: number, newStatus: string) => {
    try {
      if (newStatus === 'PICKED_UP') await markPickedUp(deliveryId);
      else if (newStatus === 'OUT_FOR_DELIVERY') await markOutForDelivery(deliveryId);
      else if (newStatus === 'DELIVERED') await markDelivered(deliveryId);

      setActiveDelivery(prev => prev ? { ...prev, status: newStatus as any } : null);
      
      if (newStatus === 'DELIVERED') {
        setCompletedDeliveries(prev => {
          if (activeDelivery) return [{...activeDelivery, status: 'DELIVERED' as any}, ...prev];
          return prev;
        });
        setTimeout(() => setActiveDelivery(null), 2000); // clear after 2s
      }
    } catch (e) {
      console.error("Failed status change", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex text-slate-800 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex shrink-0 h-screen">
        <div>
          <div className="p-4 flex items-center gap-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-[#006e2f] rounded flex items-center justify-center text-white font-bold">
              HL
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#006e2f] leading-tight">HyperLocal</h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Partner Portal</p>
            </div>
          </div>

          <div className="p-4">
            <div className="bg-[#f0f4f8] rounded-xl p-3 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#006e2f] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                {partnerInitials}
              </div>
              <div>
                <p className="font-bold text-sm">{partnerName}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="text-amber-500">★</span> 4.9 • Indiranagar
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-[#eef2ff] text-blue-700 rounded-lg text-sm font-medium transition-colors">
                <LayoutDashboard className="w-5 h-5 text-blue-700 opacity-100" />
                Dashboard
              </a>
              <a href="#" className="flex justify-between items-center px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-slate-500 opacity-70" />
                  Deliveries
                </div>
                {availableDeliveries.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs py-0.5 px-2 rounded-full font-bold">{availableDeliveries.length} New</span>
                )}
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <MapPin className="w-5 h-5 text-slate-500 opacity-70" />
                Active Trips
              </a>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className={`rounded-lg p-3 flex justify-between items-center border mb-4 transition-colors ${
            connectionState === 'CONNECTED' 
              ? 'bg-[#eefcf4] border-emerald-100' 
              : connectionState === 'DISCONNECTED' || connectionState === 'RECONNECTING'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className={connectionState === 'CONNECTED' ? 'text-emerald-500' : 'text-amber-500'}>⚡</span> STOMP Sync
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${
              connectionState === 'CONNECTED' ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {connectionState === 'CONNECTED' ? (
                <>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live Updates
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  {connectionState === 'CONNECTING' || connectionState === 'RECONNECTING' ? 'Reconnecting...' : 'Disconnected'}
                </>
              )}
            </div>
          </div>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors mb-2"
          >
            <Settings className="w-5 h-5 text-slate-500 opacity-70" />
            Settings
          </a>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
          >
            <svg className="w-5 h-5 text-red-500 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-sm font-medium">
              <span className="text-slate-400">📍</span>
              Indiranagar Hub
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              disabled={isPresenceLoading}
              className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                isPresenceLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
                isOnline ? 'bg-[#eefcf4] border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => isOnline ? goOffline() : goOnline()}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
        </header>

        {/* Dashboard Content scrollable area */}
        <div className="flex-1 overflow-auto p-6">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center items-center">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Available</span>
              <span className="text-3xl font-black text-slate-800">{availableDeliveries.length}</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center items-center">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active</span>
              <span className="text-3xl font-black text-[#006e2f]">{activeDelivery ? 1 : 0}</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center items-center">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Completed</span>
              <span className="text-3xl font-black text-blue-600">{completedDeliveries.length}</span>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-6">
            
            {/* Left Column: Available Deliveries */}
            <div className="flex-1">
              <div className="flex justify-between items-end mb-4 border-b border-slate-200 pb-2">
                <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-wider text-slate-500 text-sm">
                  Available
                </h2>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-center justify-between">
                  {errorMsg}
                  <button onClick={() => setErrorMsg(null)} className="opacity-60 hover:opacity-100">
                    <span className="sr-only">Dismiss</span>
                    &times;
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="py-12">
                  <Loading text="Finding deliveries near you..." />
                </div>
              ) : availableDeliveries.length === 0 ? (
                <EmptyState 
                  title="No deliveries nearby."
                  description="We'll notify you when one becomes available."
                  icon={<Truck className="w-6 h-6" />}
                />
              ) : (
                <div className="space-y-4">
                  {availableDeliveries.map(delivery => (
                    <DeliveryCard 
                      key={delivery.id} 
                      delivery={delivery} 
                      onAccept={handleAcceptDelivery} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Active Delivery */}
            <div className="w-full xl:w-[400px] space-y-6">
              <div className="flex justify-between items-end mb-4 border-b border-slate-200 pb-2">
                <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-wider text-slate-500 text-sm">
                  My Active Delivery
                </h2>
              </div>
              
              {activeDelivery ? (
                <div className="h-[600px]">
                  <DeliveryDetails 
                    delivery={activeDelivery} 
                    onStatusChange={handleStatusChange} 
                  />
                </div>
              ) : (
                <EmptyState 
                  title="No active deliveries"
                  description="Accept an available delivery to start."
                  icon={<MapPin className="w-6 h-6" />}
                />
              )}

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
