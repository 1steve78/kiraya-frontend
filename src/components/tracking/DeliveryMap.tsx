'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Locate, Maximize2, Minimize2, Navigation, AlertCircle, WifiOff } from 'lucide-react';
import { useDeliveryTracking } from '@/hooks/useDeliveryTracking';
import { PickupMarker } from './PickupMarker';
import { DestinationMarker } from './DestinationMarker';
import { DeliveryMarker } from './DeliveryMarker';
import { DeliveryRoute } from './DeliveryRoute';
import { DeliveryMapProps, LocationWithTimestamp } from './types';

// Fallback open vector style used if no Mapbox token is configured
const FALLBACK_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const MAPBOX_STREETS_STYLE = 'mapbox://styles/mapbox/streets-v12';

export function DeliveryMap({
  deliveryId,
  pickup,
  destination,
  partnerInfo,
  partnerLocation: externalLocation,
  status,
  connectionState: externalConnectionState,
  className = '',
  onLocationUpdate,
}: DeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [followPartner, setFollowPartner] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hook into live GPS tracking pipeline (unless externalLocation is explicitly supplied)
  const internalTracking = useDeliveryTracking(deliveryId, {
    onLocationUpdate: (coords) => {
      if (onLocationUpdate) onLocationUpdate(coords);
    },
  });

  const liveCoords = externalLocation !== undefined ? externalLocation : internalTracking.coordinates;
  const lastUpdated = internalTracking.lastUpdated;
  const connectionState = externalConnectionState || internalTracking.connectionState;
  const isDelivered = status === 'DELIVERED';

  // Format partner location with timestamp
  const activePartnerLocation: LocationWithTimestamp | null = liveCoords
    ? {
        lat: liveCoords.lat,
        lng: liveCoords.lng,
        timestamp: (liveCoords as LocationWithTimestamp).timestamp || lastUpdated || Date.now(),
      }
    : null;

  // 1. Initialize Mapbox Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
    const hasValidMapboxToken = token && token.startsWith('pk.');

    if (hasValidMapboxToken) {
      mapboxgl.accessToken = token;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: hasValidMapboxToken ? MAPBOX_STREETS_STYLE : FALLBACK_STYLE,
      center: [pickup.lng, pickup.lat],
      zoom: 13,
      attributionControl: false,
    });

    // Add navigation controls (zoom, compass)
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
      setMapInstance(map);

      // Initial Viewport: Fit all relevant locations into view
      const bounds = new mapboxgl.LngLatBounds()
        .extend([pickup.lng, pickup.lat])
        .extend([destination.lng, destination.lat]);

      if (activePartnerLocation) {
        bounds.extend([activePartnerLocation.lng, activePartnerLocation.lat]);
      }

      map.fitBounds(bounds, {
        padding: { top: 70, bottom: 70, left: 70, right: 70 },
        maxZoom: 15,
        duration: 1200,
      });
    });

    // Stop follow mode if user manually drags/pans the map
    map.on('dragstart', () => {
      setFollowPartner(false);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
      setMapLoaded(false);
    };
  }, [pickup.lat, pickup.lng, destination.lat, destination.lng]);

  // 2. Camera: Pan to partner when "Follow Partner" is active
  useEffect(() => {
    if (!mapRef.current || !followPartner || !activePartnerLocation || isDelivered) return;

    mapRef.current.easeTo({
      center: [activePartnerLocation.lng, activePartnerLocation.lat],
      duration: 800,
      zoom: Math.max(mapRef.current.getZoom(), 14),
    });
  }, [activePartnerLocation, followPartner, isDelivered]);

  // 3. Reset Viewport to fit all points
  const handleFitBounds = useCallback(() => {
    if (!mapRef.current) return;

    const bounds = new mapboxgl.LngLatBounds()
      .extend([pickup.lng, pickup.lat])
      .extend([destination.lng, destination.lat]);

    if (activePartnerLocation) {
      bounds.extend([activePartnerLocation.lng, activePartnerLocation.lat]);
    }

    mapRef.current.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 15,
      duration: 800,
    });
    setFollowPartner(false);
  }, [pickup, destination, activePartnerLocation]);

  // 4. Toggle Fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      mapRef.current?.resize();
    }, 150);
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-sm transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen rounded-none' : className || 'h-[360px] md:h-[440px]'
      }`}
    >
      {/* Map Container DOM */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Child Markers & Route attached to Mapbox instance */}
      {mapLoaded && mapInstance && (
        <>
          <PickupMarker map={mapInstance} pickup={pickup} />
          <DestinationMarker map={mapInstance} destination={destination} />
          <DeliveryRoute
            map={mapInstance}
            pickup={pickup}
            destination={destination}
            token={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          />
          {!isDelivered && (
            <DeliveryMarker
              map={mapInstance}
              location={activePartnerLocation}
              partnerInfo={partnerInfo}
              isLive={connectionState === 'CONNECTED'}
            />
          )}
        </>
      )}

      {/* Top Left: Shop / Destination Quick Status Pill */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-[240px]">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-slate-200 text-xs font-semibold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006e2f]" />
          <span className="truncate">{pickup.name}</span>
        </div>
      </div>

      {/* Map Action Controls: Recenter & Follow Partner & Fullscreen */}
      <div className="absolute top-4 right-14 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200">
        <button
          type="button"
          onClick={handleFitBounds}
          title="Fit route in view"
          className="p-1.5 text-slate-700 hover:text-[#006e2f] hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Locate className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setFollowPartner((prev) => !prev)}
          title={followPartner ? 'Unfollow partner' : 'Follow partner'}
          className={`p-1.5 rounded-xl transition-colors ${
            followPartner ? 'bg-[#006e2f] text-white' : 'text-slate-700 hover:text-[#006e2f] hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen map'}
          className="p-1.5 text-slate-700 hover:text-[#006e2f] hover:bg-slate-100 rounded-xl transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Overlays: Live GPS Status / Waiting / Reconnecting */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          {isDelivered ? (
            <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                Delivery completed successfully
              </span>
              <span>Delivered</span>
            </div>
          ) : activePartnerLocation ? (
            <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-200/90 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{partnerInfo?.name || 'Rahul S.'}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {activePartnerLocation.lat.toFixed(4)}, {activePartnerLocation.lng.toFixed(4)}
                  </div>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500 font-medium">
                {connectionState === 'RECONNECTING' ? (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5" /> Reconnecting...
                  </span>
                ) : (
                  <span>Updated {new Date(activePartnerLocation.timestamp || Date.now()).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Waiting for delivery partner&apos;s GPS signal...</span>
              </div>
              <span className="text-[11px] text-slate-400">Route ready</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
