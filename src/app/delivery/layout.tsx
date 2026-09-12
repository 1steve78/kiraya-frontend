'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['DELIVERY_PARTNER']}>
      <AppShell>
        {children}
      </AppShell>
    </AuthGuard>
  );
}
