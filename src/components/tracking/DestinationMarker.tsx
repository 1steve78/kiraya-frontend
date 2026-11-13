'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { DestinationLocation } from './types';

interface DestinationMarkerProps {
  map: mapboxgl.Map | null;
  destination: DestinationLocation;
}

export function DestinationMarker({ map, destination }: DestinationMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create custom DOM element for Customer / Drop-off Pin
    const el = document.createElement('div');
    el.className = 'destination-marker-container cursor-pointer select-none group';
    el.innerHTML = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          background: #2563eb;
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
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #93c5fd;"></span>
          <span>Delivery Address</span>
        </div>
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid #ffffff;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: transform 0.2s ease;
        ">
          <svg style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #2563eb;
          margin-top: -2px;
        "></div>
      </div>
    `;

    // Popup with Destination Details
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
      className: 'kiraya-map-popup',
    }).setHTML(`
      <div style="padding: 8px 10px; font-family: sans-serif;">
        <div style="font-size: 10px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
          Delivery Destination
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #0f172a;">
          ${destination.name || 'Customer Location'}
        </div>
        ${destination.address ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${destination.address}</div>` : ''}
      </div>
    `);

    // Create marker
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat([destination.lng, destination.lat])
      .setPopup(popup)
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, destination.lat, destination.lng, destination.name, destination.address]);

  return null;
}
