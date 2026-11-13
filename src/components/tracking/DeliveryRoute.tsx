'use client';

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Coordinates } from './types';

interface DeliveryRouteProps {
  map: mapboxgl.Map | null;
  pickup: Coordinates;
  destination: Coordinates;
  token?: string;
}

// In-memory geometry cache to avoid re-fetching on marker updates
const routeGeometryCache = new Map<string, [number, number][]>();

// Pre-defined fallback waypoints matching the simulator route between Indiranagar & Koramangala
const SIMULATOR_WAYPOINTS: [number, number][] = [
  [77.5946, 12.9716], // Shop (Indiranagar 100ft Rd)
  [77.5975, 12.9732], // 12th Main Junction
  [77.6010, 12.9750], // Domlur Flyover
  [77.6035, 12.9768], // Koramangala Ring Rd
  [77.6060, 12.9785], // Customer Doorstep
];

export function DeliveryRoute({ map, pickup, destination, token }: DeliveryRouteProps) {
  useEffect(() => {
    if (!map) return;

    let isMounted = true;
    const cacheKey = `${pickup.lng.toFixed(4)},${pickup.lat.toFixed(4)}->${destination.lng.toFixed(4)},${destination.lat.toFixed(4)}`;

    const SOURCE_ID = 'delivery-route-source';
    const CASING_LAYER_ID = 'delivery-route-casing';
    const LINE_LAYER_ID = 'delivery-route-line';

    const renderGeoJsonRoute = (coordinates: [number, number][]) => {
      if (!isMounted || !map) return;

      const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      };

      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
      if (source) {
        source.setData(geojson);
      } else {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: geojson,
        });

        // Background white outline casing for high contrast on any map style
        map.addLayer({
          id: CASING_LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 7,
            'line-opacity': 0.85,
          },
        });

        // Primary Route Line (Kiraya brand green)
        map.addLayer({
          id: LINE_LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#006e2f',
            'line-width': 4,
            'line-opacity': 0.95,
          },
        });
      }
    };

    const fetchRoute = async () => {
      // 1. Check in-memory cache
      if (routeGeometryCache.has(cacheKey)) {
        renderGeoJsonRoute(routeGeometryCache.get(cacheKey)!);
        return;
      }

      // 2. Attempt Mapbox Directions API if access token is present
      const mapboxToken = token || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (mapboxToken && !mapboxToken.startsWith('mock_')) {
        try {
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?geometries=geojson&overview=full&access_token=${mapboxToken}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const coords = data.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
            if (coords && coords.length > 0) {
              routeGeometryCache.set(cacheKey, coords);
              renderGeoJsonRoute(coords);
              return;
            }
          }
        } catch {
          // Network failure or token rejection — gracefully proceed to fallback
        }
      }

      // 3. Fallback Route Generation
      // Check if coordinates match or closely correlate with the default simulator route
      const isNearSimulatorRoute =
        Math.abs(pickup.lat - 12.9716) < 0.05 && Math.abs(pickup.lng - 77.5946) < 0.05;

      const fallbackCoords: [number, number][] = isNearSimulatorRoute
        ? SIMULATOR_WAYPOINTS
        : [
            [pickup.lng, pickup.lat],
            [
              (pickup.lng + destination.lng) / 2 + 0.001,
              (pickup.lat + destination.lat) / 2 - 0.001,
            ],
            [destination.lng, destination.lat],
          ];

      routeGeometryCache.set(cacheKey, fallbackCoords);
      renderGeoJsonRoute(fallbackCoords);
    };

    // If map style is still loading, wait for 'load' event
    if (map.isStyleLoaded()) {
      void fetchRoute();
    } else {
      map.once('load', () => {
        void fetchRoute();
      });
    }

    return () => {
      isMounted = false;
      try {
        if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
        if (map.getLayer(CASING_LAYER_ID)) map.removeLayer(CASING_LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch {
        // Map instance might already be torn down
      }
    };
  }, [map, pickup.lat, pickup.lng, destination.lat, destination.lng, token]);

  return null;
}
