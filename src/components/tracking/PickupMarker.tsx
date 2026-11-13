'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { PickupLocation } from './types';

interface PickupMarkerProps {
  map: mapboxgl.Map | null;
  pickup: PickupLocation;
}

export function PickupMarker({ map, pickup }: PickupMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create custom DOM element for Shop / Pickup Pin
    const el = document.createElement('div');
    el.className = 'pickup-marker-container cursor-pointer select-none group';
    el.innerHTML = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          background: #006e2f;
          color: white;
          padding: 3px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
          border: 2px solid #ffffff;
          margin-bottom: 2px;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #4ae176;"></span>
          <span>${pickup.name}</span>
        </div>
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #006e2f;
          border: 3px solid #ffffff;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: transform 0.2s ease;
        ">
          <svg style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
            <path d="M2 7h20"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #006e2f;
          margin-top: -2px;
        "></div>
      </div>
    `;

    // Popup with Shop Details
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
      className: 'kiraya-map-popup',
    }).setHTML(`
      <div style="padding: 8px 10px; font-family: sans-serif;">
        <div style="font-size: 10px; font-weight: 700; color: #006e2f; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
          Pickup Location
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #0f172a;">
          ${pickup.name}
        </div>
        ${pickup.address ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${pickup.address}</div>` : ''}
      </div>
    `);

    // Create marker
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat([pickup.lng, pickup.lat])
      .setPopup(popup)
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, pickup.lat, pickup.lng, pickup.name, pickup.address]);

  return null;
}
