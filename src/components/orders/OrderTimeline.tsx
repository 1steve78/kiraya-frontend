// components/orders/OrderTimeline.tsx
import React from 'react';
import { OrderStatus } from '@/types/order';
import { Check, X, Truck } from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  updatedAt?: string;
}

const NORMAL_STEPS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const STATUS_DETAILS: Record<OrderStatus, { label: string; subtext: string }> = {
  PENDING: { label: 'Order Placed', subtext: 'Order received by server' },
  CONFIRMED: { label: 'Shop Accepted', subtext: 'Merchant confirmed order' },
  PREPARING: { label: 'Preparing', subtext: 'Packing your items' },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', subtext: 'Waiting for driver' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', subtext: 'Arriving soon' },
  DELIVERED: { label: 'Delivered', subtext: 'Order completed' },
  CANCELLED: { label: 'Cancelled', subtext: 'Order was cancelled' },
};

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const isCancelled = currentStatus === 'CANCELLED';

  const stepsToShow = isCancelled
    ? (['PENDING', 'CONFIRMED', 'CANCELLED'] as OrderStatus[])
    : NORMAL_STEPS;

  const currentIndex = NORMAL_STEPS.indexOf(currentStatus);
  const progressPercent = isCancelled
    ? 100
    : currentIndex >= 0
    ? Math.min(100, Math.round(((currentIndex + 0.5) / (NORMAL_STEPS.length - 1)) * 100))
    : 0;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#006e2f]">
          <Truck className="w-4 h-4 text-[#006e2f]" />
        </div>
        <span>Live Status</span>
      </h2>

      <div className="relative pl-6">
        {/* Background Vertical Line */}
        <div className="absolute left-[11px] top-3 bottom-6 w-0.5 bg-slate-200 z-0" />
        
        {/* Active Progress Fill Line */}
        <div
          className={`absolute left-[11px] top-3 w-0.5 z-0 transition-all duration-700 ${
            isCancelled ? 'bg-red-500' : 'bg-[#22c55e]'
          }`}
          style={{ height: `${progressPercent}%` }}
        />

        <div className="space-y-6">
          {stepsToShow.map((step, index) => {
            let state: 'completed' | 'current' | 'upcoming' = 'upcoming';

            if (isCancelled) {
              if (step === 'CANCELLED') state = 'current';
              else state = 'completed';
            } else {
              if (index < currentIndex) state = 'completed';
              else if (index === currentIndex) state = 'current';
            }

            const isCurrentActive = state === 'current' && !isCancelled;
            const isDelivered = state === 'completed' || (state === 'current' && step === 'DELIVERED');

            return (
              <div key={step} className="relative z-10 flex items-start gap-4">
                {/* Node Dot / Badge */}
                {state === 'completed' ? (
                  <div className="w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                ) : isCurrentActive ? (
                  <div className="relative w-6 h-6 shrink-0 flex items-center justify-center mt-0.5">
                    <div className="absolute inset-0 rounded-full bg-[#22c55e] pulse-ring" />
                    <div className="relative w-4 h-4 rounded-full bg-[#22c55e] border-2 border-white z-10 shadow-xs" />
                  </div>
                ) : state === 'current' && isCancelled ? (
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <X className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0 mt-0.5" />
                )}

                {/* Text / Highlight Box */}
                <div className="flex-1">
                  {isCurrentActive ? (
                    <div className="bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200/60 -mt-1 shadow-xs inline-block w-full">
                      <p className="text-sm font-bold text-[#006e2f]">
                        {STATUS_DETAILS[step]?.label || step}
                      </p>
                      <p className="text-xs font-medium text-emerald-700/80 mt-0.5">
                        {STATUS_DETAILS[step]?.subtext || 'In progress'}
                      </p>
                    </div>
                  ) : state === 'current' && isCancelled ? (
                    <div className="bg-red-50 px-3.5 py-2 rounded-xl border border-red-200 -mt-1 shadow-xs inline-block w-full">
                      <p className="text-sm font-bold text-red-700">
                        {STATUS_DETAILS[step]?.label || step}
                      </p>
                      <p className="text-xs font-medium text-red-600/80 mt-0.5">
                        {STATUS_DETAILS[step]?.subtext || 'Order was cancelled'}
                      </p>
                    </div>
                  ) : (
                    <div className={state === 'upcoming' ? 'opacity-50' : ''}>
                      <p className="text-sm font-bold text-slate-900">
                        {STATUS_DETAILS[step]?.label || step}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {state === 'completed'
                          ? isDelivered && step === 'DELIVERED'
                            ? 'Delivered'
                            : 'Completed'
                          : 'Pending'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
