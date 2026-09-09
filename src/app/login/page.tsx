'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { loginApi } from '@/lib/api/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect immediately based on role
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { jwtDecode } = require('jwt-decode');
      const decoded: any = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem('token');
        return;
      }
      const role = decoded.role;
      if (role === 'SHOP_OWNER' || role === 'SHOP_STAFF') {
        router.replace(decoded.shopId ? '/shop/dashboard' : '/shop/create');
      } else if (role === 'DELIVERY_PARTNER') {
        router.replace('/delivery/dashboard');
      } else if (role === 'ADMIN') {
        router.replace('/admin');
      } else {
        router.replace(next === '/login' ? '/' : next);
      }
    } catch {
      // Token is malformed — ignore, let user log in fresh
    }
  }, [next, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginApi({ email, password });

      // Role-based redirect
      const role = result.user.role;
      const shopId = result.user.shopId ?? null;
      console.log('[LoginPage] 🎯 Login success → role:', role, '| shopId:', shopId);

      if (role === 'SHOP_OWNER' || role === 'SHOP_STAFF') {
        const destination = shopId ? `/shop/dashboard` : `/shop/create`;
        console.log('[LoginPage] 🏪 Redirecting shop user →', destination);
        router.replace(destination);
      } else if (role === 'DELIVERY_PARTNER') {
        console.log('[LoginPage] 🚴 Redirecting delivery partner → /delivery/dashboard');
        router.replace('/delivery/dashboard');
      } else if (role === 'ADMIN') {
        console.log('[LoginPage] 🛡️  Redirecting admin → /admin');
        router.replace('/admin');
      } else {
        const destination = next === '/login' ? '/' : next;
        console.log('[LoginPage] 👤 Redirecting customer →', destination);
        router.replace(destination);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      console.error('[LoginPage] ❌ Login failed →', msg);
      setError(
        msg.toLowerCase().includes('401') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('bad credentials')
          ? 'Invalid email or password. Please try again.'
          : msg
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center px-4 font-sans antialiased">
      {/* Logo */}
      <Link href="/" className="font-extrabold text-3xl text-[#006e2f] tracking-tight mb-8 hover:opacity-80 transition-opacity">
        HyperLocal
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-6">Sign in to your account to continue</p>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006e2f] focus:ring-3 focus:ring-emerald-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-[#006e2f] focus:ring-3 focus:ring-emerald-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#006e2f] hover:bg-emerald-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400 font-medium">or</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-[#006e2f] hover:underline">
            Create one
          </Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-slate-400 text-center">
        By signing in you agree to our{' '}
        <a href="#" className="underline hover:text-slate-600">Terms of Service</a>{' '}
        and{' '}
        <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
