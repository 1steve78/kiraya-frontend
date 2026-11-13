'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, Store, MapPin, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { OrderStatus } from '@/types/order';
import { PickupLocation, DestinationLocation, DeliveryPartnerInfo } from './types';

interface DeliveryInfoPanelProps {
  status: OrderStatus;
  pickup: PickupLocation;
  destination: DestinationLocation;
  partnerInfo?: DeliveryPartnerInfo;
  isLiveTracking?: boolean;
}

export function DeliveryInfoPanel({
  status,
  pickup,
  destination,
  partnerInfo,
  isLiveTracking = false,
}: DeliveryInfoPanelProps) {
  const partnerName = partnerInfo?.name || 'Rahul S.';
  const partnerPhone = partnerInfo?.phone || '+919876543210';
  const partnerPhoto =
    partnerInfo?.photoUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAXMKGblyhNmD5A_3TS_49f6NwwzVE8gZYrMGuonI4Pdx_j4QMK3dOtozz7fJ7kdcMH8nxt2vQchNekkZvWbAFgXSNf_6Y8A23iNaPAbVUhITlHXxB2oZ53pSsuk2qYyiw76mZIbwBCIXJ2ZeDQS7DM6KFaQdCLsAIhIPoAER4CDfZp0Qfnmjrubbs-3D95qPgUHM6RZrfE4s2pQDK052BptKPgjw8kUffmzCBpcOttL-ACPKgQnmPh9Q';

  const formatStatus = (s: OrderStatus) => {
    switch (s) {
      case 'PENDING':
        return { label: 'Order Received', desc: 'Waiting for store confirmation', color: 'text-amber-600 bg-amber-50' };
      case 'CONFIRMED':
      case 'PREPARING':
        return { label: 'Preparing Items', desc: 'Shop is packing your order', color: 'text-blue-600 bg-blue-50' };
      case 'READY_FOR_PICKUP':
      case 'ASSIGNED':
      case 'ACCEPTED':
        return { label: 'Partner Assigned', desc: 'Partner is heading to shop', color: 'text-indigo-600 bg-indigo-50' };
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY':
        return { label: 'On The Way', desc: 'Heading towards your doorstep', color: 'text-emerald-700 bg-emerald-50' };
      case 'DELIVERED':
        return { label: 'Delivered', desc: 'Package dropped off successfully', color: 'text-emerald-800 bg-emerald-100' };
      case 'CANCELLED':
        return { label: 'Cancelled', desc: 'Order was cancelled', color: 'text-red-600 bg-red-50' };
      default:
        return { label: s, desc: 'Processing delivery', color: 'text-slate-700 bg-slate-100' };
    }
  };

  const statusConfig = formatStatus(status);

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Partner Profile Card */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
            <Image
              src={partnerPhoto}
              alt={partnerName}
              fill
              className="object-cover"
              sizes="56px"
            />
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                isLiveTracking ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base md:text-lg text-slate-900">{partnerName}</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Delivery Partner · Honda Activa</span>
            </p>
          </div>
        </div>

        <a
          href={`tel:${partnerPhone}`}
          className="w-11 h-11 rounded-full bg-emerald-50 text-[#006e2f] flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all shadow-xs shrink-0"
          title={`Call ${partnerName}`}
          aria-label="Call delivery partner"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>

      {/* 2. Route Waypoints Card (Pickup & Destination) */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Delivery Route Details
        </h4>

        <div className="relative flex flex-col gap-6 pl-2">
          {/* Vertical connecting line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-dashed border-l-2 border-dashed border-slate-200" />

          {/* Shop / Pickup Waypoint */}
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-[#006e2f] text-[#006e2f] flex items-center justify-center shrink-0">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div className="flex-grow">
              <span className="text-[11px] font-bold uppercase text-[#006e2f] tracking-wide block">
                Pickup Point
              </span>
              <div className="text-sm font-bold text-slate-900">{pickup.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {pickup.address || 'Indiranagar 100ft Road, Bengaluru'}
              </div>
            </div>
          </div>

          {/* Customer / Drop-off Waypoint */}
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-blue-600 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="flex-grow">
              <span className="text-[11px] font-bold uppercase text-blue-600 tracking-wide block">
                Destination
              </span>
              <div className="text-sm font-bold text-slate-900">
                {destination.name || 'Your Address'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {destination.address || 'Koramangala 4th Block, Bengaluru'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Status Summary Pill */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            {status === 'DELIVERED' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Clock className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Current Status</div>
            <div className="text-sm font-extrabold text-slate-900">{statusConfig.label}</div>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusConfig.color}`}>
          {statusConfig.desc}
        </span>
      </div>
    </div>
  );
}
