'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getNavigationForRole } from '@/config/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Wait until user context is loaded
  if (!user) return null;

  const navItems = getNavigationForRole(user.role);

  // Mock initial details for the sidebar header
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'HL';
  const roleName = user.role.replace('_', ' ');

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex shrink-0 h-screen">
      <div>
        {/* App Logo Area */}
        <div className="p-4 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 bg-[#006e2f] rounded flex items-center justify-center text-white font-bold">
            HL
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#006e2f] leading-tight">HyperLocal</h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              {roleName}
            </p>
          </div>
        </div>

        <div className="p-4">
          {/* User Info / Shop Info Area */}
          <div className="bg-[#f0f4f8] rounded-xl p-3 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#006e2f] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              // Highlight active based on path
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/shop/dashboard' && item.href !== '/delivery/dashboard' && item.href !== '/home');
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

      <div className="p-4 border-t border-gray-100 space-y-1">
        {/* We can potentially show different settings links based on role */}
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
        >
          <LogOut className="w-5 h-5 text-red-500 opacity-70" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
