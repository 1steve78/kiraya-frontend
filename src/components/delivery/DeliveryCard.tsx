'use client';

import React, { useState } from 'react';
import { Delivery } from '@/types/delivery';

interface DeliveryCardProps {
  delivery: Delivery;
  onAccept?: (deliveryId: number) => Promise<void>;
  onViewDetails?: (deliveryId: number) => void;
}

export function DeliveryCard({ delivery, onAccept, onViewDetails }: DeliveryCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    if (!onAccept) return;
    setIsAccepting(true);
    try {
      await onAccept(delivery.id);
    } finally {
      setIsAccepting(false);
    }
  };

  // Derive visual properties from Delivery interface
  const isExpress = delivery.status === 'READY_FOR_PICKUP'; // Or some other logic
  const typeTag = isExpress ? 'Express • Instant Dispatch' : 'Standard Delivery';
  const tagClass = isExpress ? 'bg-[#fff7ed] text-amber-700' : 'bg-slate-100 text-slate-600';
  
  const payout = delivery.totalAmount ? `₹${(delivery.totalAmount * 0.15).toFixed(0)}` : '₹60'; 
  const payoutBreakdown = 'Delivery fee';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${isAccepting ? 'border-emerald-500 opacity-90' : 'border-slate-100 hover:border-emerald-200 hover:shadow-md'} p-5 transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-black">#{delivery.orderId}</h3>
          <span className={`text-xs font-bold px-2 py-1 rounded ${tagClass}`}>
            {typeTag}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-[#006e2f]">{payout}</div>
          <div className="text-[10px] font-bold text-slate-400">{payoutBreakdown}</div>
        </div>
      </div>

      <div className="relative pl-6 mb-5 border-l-2 border-slate-100 ml-3 space-y-4">
        <div className="relative">
          <div className="absolute -left-[31px] top-1 w-6 h-6 bg-[#eef2ff] border-2 border-white rounded-full flex items-center justify-center text-[10px]">🏪</div>
          <div className="flex justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-800">{delivery.shop.name}</h4>
              <p className="text-xs text-slate-500">{delivery.shop.address || 'Shop address'}</p>
            </div>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Pickup</div>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -left-[31px] top-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px]">📍</div>
          <div className="flex justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-800">Customer Destination</h4>
              <p className="text-xs text-slate-500">{delivery.destination?.address || 'Customer address'}</p>
            </div>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Drop-off</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5"><span className="text-emerald-600">↱</span> {delivery.distanceKm ? `${delivery.distanceKm} km` : '2.4 km'}</div>
          <div className="flex items-center gap-1.5"><span className="text-slate-400">⏱</span> ~12 mins</div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {onViewDetails && (
            <button 
              disabled={isAccepting}
              onClick={() => onViewDetails(delivery.id)}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors text-sm disabled:opacity-50"
            >
              View Details
            </button>
          )}
          {onAccept && (
            <button 
              disabled={isAccepting}
              onClick={handleAccept}
              className={`flex-1 md:flex-none px-5 py-2 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm shadow-sm ${
                isAccepting ? 'bg-emerald-600/80 text-white cursor-wait' : 'bg-[#006e2f] text-white hover:bg-emerald-800'
              }`}
            >
              {isAccepting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Accepting...
                </>
              ) : (
                <>Accept <span>→</span></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
