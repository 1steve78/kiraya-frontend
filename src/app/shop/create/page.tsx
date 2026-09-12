'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, Loader2, AlertCircle, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { createShopApi } from '@/lib/api/shop-setup';
import { AuthGuard } from '@/components/auth/AuthGuard';

function CreateShopForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createShopApi({ name, address, phone });
      // Fresh token (with shopId) is now saved in localStorage by createShopApi.
      // Redirect to dashboard.
      router.replace('/shop/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create shop';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center px-4 font-sans antialiased">
      {/* Logo */}
      <Link href="/" className="font-extrabold text-3xl text-[#006e2f] tracking-tight mb-2 hover:opacity-80 transition-opacity">
        HyperLocal
      </Link>
      <p className="text-sm text-slate-500 mb-8">Shop Owner Portal</p>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-[#006e2f]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Set up your shop</h1>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6 ml-[52px]">
          You&apos;re almost there! Tell us about your shop.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Shop Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Shop Name
            </label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Fresh Mart"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#006e2f] focus:ring-3 focus:ring-emerald-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={2}
                placeholder="e.g. 12, MG Road, Bengaluru, Karnataka 560001"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#006e2f] focus:ring-3 focus:ring-emerald-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="e.g. +91 98765 43210"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#006e2f] focus:ring-3 focus:ring-emerald-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* What happens next info */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">What happens next?</p>
            {['Your shop will be created instantly', 'You will be taken to your order dashboard', 'Start accepting orders from customers'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-700">{item}</span>
              </div>
            ))}
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
                <span>Creating your shop...</span>
              </>
            ) : (
              <>
                <Store className="w-4 h-4" />
                <span>Create Shop &amp; Continue</span>
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-slate-400 text-center">
        Signed in as a Shop Owner.{' '}
        <Link href="/login" className="underline hover:text-slate-600">
          Sign out
        </Link>
      </p>
    </div>
  );
}

export default function CreateShopPage() {
  return (
    <AuthGuard allowedRoles={['SHOP_OWNER', 'ADMIN']}>
      <CreateShopForm />
    </AuthGuard>
  );
}
