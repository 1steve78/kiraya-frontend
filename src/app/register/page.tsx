'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, ShoppingBag, Store, Truck, ShieldCheck } from 'lucide-react';
import { loginApi } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';

type Role = 'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_PARTNER';

const ROLES: { value: Role; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'CUSTOMER',
    label: 'Customer',
    description: 'Order groceries & essentials',
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    value: 'SHOP_OWNER',
    label: 'Shop Owner',
    description: 'Manage shop & orders',
    icon: <Store className="w-5 h-5" />,
  },
  {
    value: 'DELIVERY_PARTNER',
    label: 'Delivery Partner',
    description: 'Pick up & deliver orders',
    icon: <Truck className="w-5 h-5" />,
  },
];

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Register
      await apiClient.post('/auth/register', { name, email, password, role });

      // 2. Auto-login
      const result = await loginApi({ email, password });

      // 3. Role-based redirect
      const userRole = result.user.role;
      if (userRole === 'SHOP_OWNER' || userRole === 'SHOP_STAFF') {
        router.replace('/shop/dashboard');
      } else if (userRole === 'DELIVERY_PARTNER') {
        router.replace('/delivery/dashboard');
      } else {
        router.replace('/');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(
        msg.toLowerCase().includes('already') ? 'This email is already registered. Try logging in.' : msg
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center px-4 py-12 font-sans antialiased">
      {/* Logo */}
      <Link href="/" className="font-extrabold text-3xl text-[#006e2f] tracking-tight mb-8 hover:opacity-80 transition-opacity">
        HyperLocal
      </Link>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h1>
        <p className="text-sm text-slate-500 mb-6">Choose your role and get started in seconds</p>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Picker */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              I am a…
            </label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`relative flex flex-col items-center text-center p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                    role === r.value
                      ? 'border-[#006e2f] bg-emerald-50 text-[#004b1e] shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {role === r.value && (
                    <div className="absolute top-2 right-2">
                      <ShieldCheck className="w-4 h-4 text-[#006e2f]" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 shrink-0 transition-colors ${
                    role === r.value ? 'bg-[#006e2f] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {r.icon}
                  </div>
                  <p className="font-bold text-xs sm:text-sm leading-tight text-slate-900">{r.label}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">{r.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Yasin Khan"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006e2f] focus:ring-3 focus:ring-emerald-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
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

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat your password"
                className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-3 ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                    : 'border-slate-200 focus:border-[#006e2f] focus:ring-emerald-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || (!!confirmPassword && confirmPassword !== password)}
            className="w-full bg-[#006e2f] hover:bg-emerald-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              `Create ${ROLES.find((r) => r.value === role)?.label} Account`
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
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#006e2f] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
