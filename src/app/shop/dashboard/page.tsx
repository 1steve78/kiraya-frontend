'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Package, Store, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function ShopOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900">Dashboard Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orders Stat */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Today's Orders</p>
              <h3 className="text-2xl font-extrabold text-slate-900">24</h3>
            </div>
          </div>
          <Link href="/shop/dashboard/orders" className="mt-auto flex items-center text-sm font-bold text-blue-600 hover:text-blue-700">
            View Orders <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Revenue Stat */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Today's Revenue</p>
              <h3 className="text-2xl font-extrabold text-slate-900">₹4,250</h3>
            </div>
          </div>
          <Link href="/shop/dashboard/orders" className="mt-auto flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700">
            View Analytics <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Products Stat */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Products</p>
              <h3 className="text-2xl font-extrabold text-slate-900">142</h3>
            </div>
          </div>
          <Link href="/shop/dashboard/products" className="mt-auto flex items-center text-sm font-bold text-purple-600 hover:text-purple-700">
            Manage Products <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Inventory Stat */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Low Stock Items</p>
              <h3 className="text-2xl font-extrabold text-slate-900">8</h3>
            </div>
          </div>
          <Link href="/shop/dashboard/inventory" className="mt-auto flex items-center text-sm font-bold text-amber-600 hover:text-amber-700">
            Update Inventory <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
