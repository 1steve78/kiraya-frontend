'use client';

import React from 'react';
import { Plus, Search, Filter, Package } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500">Manage your store catalog and product details.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#006e2f] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-800 transition-colors shadow-xs">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]/20 focus:border-[#006e2f] transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Package className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No products yet</h3>
          <p className="text-slate-500 text-sm mb-4">Start by adding your first product to the catalog.</p>
          <button className="inline-flex items-center gap-2 bg-[#006e2f] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-800 transition-colors shadow-xs">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}

