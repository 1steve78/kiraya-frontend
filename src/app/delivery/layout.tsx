'use client';

import React from 'react';
import { AuthGuard } from '@/components/AuthGuard';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['DELIVERY_PARTNER']}>
      {children}
    </AuthGuard>
  );
}
