'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ForbiddenPage() {
  const { user, isAuthLoaded } = useAuth();
  
  // Prevent hydration mismatch or flashing if auth is still loading
  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#006e2f] rounded-full animate-spin" />
      </div>
    );
  }

  // Determine the best "dashboard" path based on role
  let dashboardPath = '/';
  if (user?.role === 'SHOP_OWNER' || user?.role === 'SHOP_STAFF') {
    dashboardPath = '/shop/dashboard';
  } else if (user?.role === 'DELIVERY_PARTNER') {
    dashboardPath = '/delivery/dashboard';
  } else if (user?.role === 'CUSTOMER') {
    dashboardPath = '/home'; // or whatever the main customer route is
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center px-4 font-sans antialiased text-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200/80 p-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">403</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Access Denied</h2>
        
        <p className="text-slate-500 mb-8">
          You don't have permission to access this page.
        </p>
        
        <Link 
          href={dashboardPath}
          className="w-full bg-[#006e2f] hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] shadow-sm block text-center"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
