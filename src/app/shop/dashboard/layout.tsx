'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';

export default function ShopDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['SHOP_OWNER', 'SHOP_STAFF', 'ADMIN']}>
      <AppShell>
        {children}
      </AppShell>
    </AuthGuard>
  );
}
