'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { LocationWithTimestamp, DeliveryPartnerInfo } from './types';

interface DeliveryMarkerProps {
  map: mapboxgl.Map | null;
  location: LocationWithTimestamp | null;
  partnerInfo?: DeliveryPartnerInfo;
  isLive?: boolean;
}

// Calculate compass bearing between two points in degrees (0 - 360)
function calculateBearing(startLat: number, startLng: number, endLat: number, endLng: number): number {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const endLatRad = (endLat * Math.PI) / 180;
  const endLngRad = (endLng * Math.PI) / 180;
  const dLng = endLngRad - startLngRad;
  const y = Math.sin(dLng) * Math.cos(endLatRad);
  const x = Math.cos(startLatRad) * Math.sin(endLatRad) - Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLng);
  const brng = Math.atan2(y, x);
  return ((brng * 180) / Math.PI + 360) % 360;
}

// Linear interpolation helper
function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function DeliveryMarker({
  map,
  location,
  partnerInfo,
  isLive = true,
}: DeliveryMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const innerIconRef = useRef<HTMLElement | null>(null);

  // Position & timestamp tracking for animation & stale packet rejection
  const prevCoordsRef = useRef<[number, number] | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const currentBearingRef = useRef<number>(0);

  // 1. Initialize Marker on Map
  useEffect(() => {
    if (!map) return;

    // Outer container
    const el = document.createElement('div');
    el.className = 'delivery-partner-marker select-none cursor-pointer';
    el.style.position = 'relative';
    el.style.width = '48px';
    el.style.height = '48px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';

    // Pulsing Radar Ring (only if live)
    const pulseRing = document.createElement('div');
    pulseRing.className = 'pulse-ring';
    pulseRing.style.position = 'absolute';
    pulseRing.style.width = '100%';
    pulseRing.style.height = '100%';
    pulseRing.style.borderRadius = '50%';
    pulseRing.style.backgroundColor = 'rgba(34, 197, 94, 0.4)';
    pulseRing.style.animation = 'kiraya-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite';

    // Inner vehicle container
    const iconContainer = document.createElement('div');
    iconContainer.className = 'vehicle-icon-container';
    iconContainer.style.width = '36px';
    iconContainer.style.height = '36px';
    iconContainer.style.borderRadius = '50%';
    iconContainer.style.backgroundColor = '#0b1c30';
    iconContainer.style.border = '2.5px solid #22c55e';
    iconContainer.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.35)';
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.color = '#ffffff';
    iconContainer.style.zIndex = '2';
    iconContainer.style.transition = 'transform 0.3s ease-out';

    // Delivery Scooter SVG Icon
    iconContainer.innerHTML = `
      <svg style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24">
        <circle cx="18.5" cy="17.5" r="3.5"/>
        <circle cx="5.5" cy="17.5" r="3.5"/>
        <circle cx="15" cy="5" r="1"/>
        <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
      </svg>
    `;

    // Mini Live Badge
    const liveBadge = document.createElement('div');
    liveBadge.style.position = 'absolute';
    liveBadge.style.top = '-2px';
    liveBadge.style.right = '-2px';
    liveBadge.style.width = '12px';
    liveBadge.style.height = '12px';
    liveBadge.style.borderRadius = '50%';
    liveBadge.style.backgroundColor = '#22c55e';
    liveBadge.style.border = '2px solid #ffffff';
    liveBadge.style.zIndex = '3';

    el.appendChild(pulseRing);
    el.appendChild(iconContainer);
    el.appendChild(liveBadge);
    innerIconRef.current = iconContainer;

    // Inject keyframes animation style if not already added
    if (!document.getElementById('kiraya-marker-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'kiraya-marker-styles';
      styleEl.innerHTML = `
        @keyframes kiraya-ping {
          75%, 100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Popup with Partner Info
    const popup = new mapboxgl.Popup({
      offset: 20,
      closeButton: false,
      className: 'kiraya-map-popup',
    });
    popupRef.current = popup;

    const initialLng = location ? location.lng : 0;
    const initialLat = location ? location.lat : 0;

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center',
    })
      .setLngLat([initialLng, initialLat])
      .setPopup(popup);

    if (location) {
      marker.addTo(map);
      prevCoordsRef.current = [location.lng, location.lat];
    }

    markerRef.current = marker;

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      marker.remove();
      markerRef.current = null;
      popupRef.current = null;
    };
  }, [map]);

  // 2. Animate Marker on Location Updates
  useEffect(() => {
    if (!map || !location) return;

    const { lat, lng, timestamp } = location;

    // Timestamp verification: Drop out-of-order / delayed GPS packets
    const currentMsgTime = timestamp ? new Date(timestamp).getTime() : Date.now();
    if (lastTimestampRef.current !== null && currentMsgTime <= lastTimestampRef.current) {
      // Stale update — ignore
      return;
    }
    lastTimestampRef.current = currentMsgTime;

    // Update popup HTML with fresh time & partner info
    const partnerName = partnerInfo?.name || 'Rahul S.';
    const timeFormatted = new Date(currentMsgTime).toLocaleTimeString();
    if (popupRef.current) {
      popupRef.current.setHTML(`
        <div style="padding: 8px 10px; font-family: sans-serif;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span>
            <span style="font-size: 10px; font-weight: 700; color: #16a34a; text-transform: uppercase;">Live Partner</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${partnerName}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
            Updated at ${timeFormatted}
          </div>
        </div>
      `);
    }

    // If marker is not yet on the map, add it and snap to position
    if (!markerRef.current) return;
    const marker = markerRef.current;

    // Check if added to map
    const markerEl = marker.getElement();
    if (!markerEl.parentElement) {
      marker.setLngLat([lng, lat]).addTo(map);
      prevCoordsRef.current = [lng, lat];
      return;
    }

    // If no previous coordinate recorded, snap immediately
    if (!prevCoordsRef.current) {
      marker.setLngLat([lng, lat]);
      prevCoordsRef.current = [lng, lat];
      return;
    }

    const [startLng, startLat] = prevCoordsRef.current;
    const endLng = lng;
    const endLat = lat;

    // If distance delta is negligible, don't trigger animation
    const delta = Math.hypot(endLng - startLng, endLat - startLat);
    if (delta < 0.000005) {
      return;
    }

    // Cancel any previous in-flight animation
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    // Compute bearing angle to rotate scooter towards movement direction
    const bearing = calculateBearing(startLat, startLng, endLat, endLng);
    currentBearingRef.current = bearing;
    if (innerIconRef.current) {
      innerIconRef.current.style.transform = `rotate(${bearing}deg)`;
    }

    // Smooth animation using requestAnimationFrame
    const ANIMATION_DURATION_MS = 1000; // 1s matches the GPS simulator update cadence
    const startTime = performance.now();

    const animateStep = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);

      // Smooth interpolation between previous and target coordinates
      const currentLng = interpolate(startLng, endLng, progress);
      const currentLat = interpolate(startLat, endLat, progress);

      marker.setLngLat([currentLng, currentLat]);

      if (progress < 1) {
        animFrameIdRef.current = requestAnimationFrame(animateStep);
      } else {
        // Animation complete — set target as new starting point for the next update
        prevCoordsRef.current = [endLng, endLat];
        animFrameIdRef.current = null;
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animateStep);
  }, [map, location, partnerInfo]);

  return null;
}
