'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Roles allowed to access this page. If omitted, any authenticated user is allowed. */
  allowedRoles?: string[];
}

/**
 * Wraps a page and redirects to /login if there is no JWT in localStorage or if it is expired.
 * If allowedRoles is specified, also redirects if the logged-in role is not in the list.
 */
export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      
      // Catch expired tokens immediately
      if (decodedToken.exp < Date.now() / 1000) {
        localStorage.removeItem('token');
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(decodedToken.role)) {
          // Logged in but wrong role — go to forbidden page
          router.replace('/forbidden');
          return;
        }
      }
    } catch {
      localStorage.removeItem('token');
      router.replace('/login');
      return;
    }

    setChecking(false);
  }, [pathname, router, allowedRoles]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#006e2f] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
