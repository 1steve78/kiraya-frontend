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
      <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen font-sans antialiased">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#006e2f] shadow-xs">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>🏪 Fresh Mart</span>
                  </h1>
                  <span className="bg-emerald-100 text-[#004b1e] text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Open
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Demo Role Switcher */}
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
                <span className="text-slate-400 font-medium">Role:</span>
                <button
                  onClick={() => switchRole(user.role === 'SHOP_OWNER' ? 'CUSTOMER' : 'SHOP_OWNER', 1)}
                  className="font-bold text-slate-700 hover:text-[#006e2f] transition-colors underline"
                  title="Click to toggle test role"
                >
                  {user.role}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto flex">
          <ShopSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
