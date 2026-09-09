// components/shop/ShopOrderSkeleton.tsx
import React from 'react';

export function ShopOrderSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded-full" />
              <div className="h-8 w-12 bg-slate-300 rounded-lg" />
              <div className="h-2.5 w-28 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Columns Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((colIndex) => (
          <div
            key={colIndex}
            className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4 min-h-[420px]"
          >
            {/* Column Header Skeleton */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="h-4 w-24 bg-slate-300 rounded-md" />
              </div>
              <div className="h-5 w-14 bg-slate-200 rounded-full" />
            </div>

            {/* Card Skeletons */}
            {[1, 2].map((cardIndex) => (
              <div
                key={cardIndex}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div className="h-4 w-20 bg-slate-300 rounded-md" />
                  <div className="h-4 w-12 bg-slate-200 rounded-full" />
                </div>
                <div className="space-y-1.5 py-1">
                  <div className="h-3 w-full bg-slate-200 rounded-md" />
                  <div className="h-3 w-3/4 bg-slate-200 rounded-md" />
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-3 w-16 bg-slate-200 rounded-md" />
                  <div className="h-4 w-12 bg-slate-300 rounded-md" />
                </div>
                <div className="pt-2 flex gap-2">
                  <div className="h-8 flex-1 bg-slate-200 rounded-xl" />
                  <div className="h-8 flex-1 bg-slate-300 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
