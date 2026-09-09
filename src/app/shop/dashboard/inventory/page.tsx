'use client';

import React from 'react';
import { Search, AlertTriangle, ArrowUpDown, Store } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Inventory Management</h2>
          <p className="text-sm text-slate-500">Track stock levels and manage low inventory alerts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">In Stock</p>
            <h4 className="text-lg font-bold text-slate-900">124 Items</h4>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Low Stock</p>
            <h4 className="text-lg font-bold text-slate-900">8 Items</h4>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Out of Stock</p>
            <h4 className="text-lg font-bold text-slate-900">3 Items</h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]/20 focus:border-[#006e2f] transition-all"
            />
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Store className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No inventory data</h3>
          <p className="text-slate-500 text-sm mb-4">Add products to your catalog to start tracking inventory.</p>
        </div>
      </div>
    </div>
  );
}
