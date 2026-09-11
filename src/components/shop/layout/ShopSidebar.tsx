'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Settings, Store } from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/shop/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/shop/dashboard/orders', icon: ShoppingBag },
  { name: 'Products', href: '/shop/dashboard/products', icon: Package },
  { name: 'Inventory', href: '/shop/dashboard/inventory', icon: Store },
];

export function ShopSidebar() {
  const pathname = usePathname();

  // Mock shop details for the sidebar, in a real app this would come from a context/hook
  const shopName = "Fresh Mart";
  const shopInitials = "FM";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex shrink-0 h-screen">
      <div>
        <div className="p-4 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 bg-[#006e2f] rounded flex items-center justify-center text-white font-bold">
            HL
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#006e2f] leading-tight">HyperLocal</h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Merchant Portal</p>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-[#f0f4f8] rounded-xl p-3 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#006e2f] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
              {shopInitials}
            </div>
            <div>
              <p className="font-bold text-sm">{shopName}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="text-amber-500">★</span> 4.8 • Active
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/shop/dashboard');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#eef2ff] text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700 opacity-100' : 'text-slate-500 opacity-70'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100">
        <Link
          href="/shop/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors mb-2"
        >
          <Settings className="w-5 h-5 text-slate-500 opacity-70" />
          Settings
        </Link>
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
  );
}
