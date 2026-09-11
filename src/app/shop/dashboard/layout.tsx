'use client';

import React from 'react';
import { Store, Clock, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/AuthGuard';
import { ShopSidebar } from '@/components/shop/layout/ShopSidebar';

export default function ShopDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, switchRole } = useAuth();

  return (
    <AuthGuard allowedRoles={['SHOP_OWNER', 'SHOP_STAFF', 'ADMIN']}>
      <div className="min-h-screen bg-[#f8f9fa] flex text-slate-800 font-sans antialiased">
        <ShopSidebar />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Header */}
          <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-30">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-sm font-medium">
                <span className="text-slate-400">📍</span>
                Main Store
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Demo Role Switcher */}
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
                <span className="text-slate-400 font-medium">Role:</span>
                <button
                  onClick={() => switchRole(user.role === 'SHOP_OWNER' ? 'CUSTOMER' : 'SHOP_OWNER', 1)}
                  className="font-bold text-slate-700 hover:text-emerald-600 transition-colors underline"
                  title="Click to toggle test role"
                >
                  {user.role}
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 min-w-0">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
