'use client';

import React, { useState } from 'react';
import { Delivery } from '@/types/delivery';
import { DeliveryTimeline } from './DeliveryTimeline';

interface DeliveryDetailsProps {
  delivery: Delivery;
  onStatusChange: (deliveryId: number, newStatus: string) => Promise<void>;
}

export function DeliveryDetails({ delivery, onStatusChange }: DeliveryDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await onStatusChange(delivery.id, newStatus);
    } catch (e) {
      console.error('Failed to change status', e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAction = () => {
    switch (delivery.status) {
      case 'ACCEPTED':
        return (
          <button
            disabled={isLoading}
            onClick={() => handleAction('PICKED_UP')}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 text-sm shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Mark Picked Up'}
          </button>
        );
      case 'PICKED_UP':
        return (
          <button
            disabled={isLoading}
            onClick={() => handleAction('OUT_FOR_DELIVERY')}
            className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center gap-2 text-sm shadow-sm hover:bg-amber-600 disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Start Delivery'}
          </button>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <button
            disabled={isLoading}
            onClick={() => handleAction('DELIVERED')}
            className="w-full py-3 rounded-xl bg-[#006e2f] text-white font-bold flex items-center justify-center gap-2 text-sm shadow-sm hover:bg-emerald-800 disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Mark Delivered'}
          </button>
        );
      case 'DELIVERED':
        return (
          <div className="w-full py-3 rounded-xl bg-slate-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
            ✓ Delivered Successfully
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50/30">
        <h3 className="font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          Delivery #{delivery.id}
        </h3>
        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">
          {delivery.status}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="text-sm font-bold text-slate-800 leading-snug">
          Order #{delivery.orderId}
        </div>

        <div className="relative pl-6 border-l-2 border-slate-200 ml-3 space-y-6">
          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-6 h-6 bg-[#eef2ff] border-2 border-white rounded-full flex items-center justify-center text-[10px]">🏪</div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-1">PICKUP</div>
              <h4 className="font-bold text-sm text-slate-800">{delivery.shop.name}</h4>
              <p className="text-xs text-slate-500 flex items-start gap-1 mt-1">
                <span>📍</span> {delivery.shop.address || 'Shop address'}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px]">📍</div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-1">DROPOFF</div>
              <h4 className="font-bold text-sm text-slate-800">Customer</h4>
              <p className="text-xs text-slate-500 flex items-start gap-1 mt-1">
                <span>📍</span> {delivery.destination?.address || 'Customer address'}
              </p>
            </div>
          </div>
        </div>
        
        {delivery.status === 'OUT_FOR_DELIVERY' && (
          <div className="h-32 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative">
            {/* Fake Map */}
            <img src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.625,12.935,14,0,0/400x200?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjazB5b2Z0eXUwOWo0M2VvMXZteTdsM2w1In0.XXX" 
                  alt="Map" className="w-full h-full object-cover opacity-80 mix-blend-multiply" 
                  onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-blue-50 flex items-center justify-center text-slate-400 text-xs font-medium">Map View</div>' }} />
          </div>
        )}

        {/* The Timeline */}
        <div className="mt-4">
          <DeliveryTimeline currentStatus={delivery.status} />
        </div>

      </div>

      <div className="p-4 bg-[#f8fafc] border-t border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase">Status:</span>
          <span className="text-sm font-bold text-slate-800">{delivery.status}</span>
        </div>
        {renderAction()}
      </div>
    </div>
  );
}
