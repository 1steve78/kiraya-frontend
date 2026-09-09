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

  return (
    <div className="w-64 bg-white border-r border-slate-200/80 h-[calc(100vh-4rem)] sticky top-16 flex flex-col hidden md:flex shrink-0">
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/shop/dashboard');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-[#006e2f] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200/80">
        <Link
          href="/shop/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          Settings
        </Link>
      </div>
    </div>
  );
}
