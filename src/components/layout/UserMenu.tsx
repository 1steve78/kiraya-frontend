'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name ? user.name.substring(0, 1).toUpperCase() : 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-4 border-l border-slate-200 focus:outline-none"
      >
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-700">{user.name}</p>
          <p className="text-[10px] uppercase font-bold text-slate-500">{user.role.replace('_', ' ')}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#006e2f] hover:bg-emerald-700 transition-colors flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-transparent focus:ring-emerald-200">
          {initials}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
            <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 truncate">{user.email}</p>
          </div>
          
          <Link 
            href="/profile" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <User className="w-4 h-4 text-slate-400" />
            Profile
          </Link>
          
          <Link 
            href="/settings" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            Settings
          </Link>
          
          <div className="h-px bg-slate-100 my-1"></div>
          
          <button 
            onClick={() => {
              setIsOpen(false);
              logout();
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
