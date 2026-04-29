'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom circle markers
const createCircleIcon = (color: string, size: number = 18) => L.divIcon({
  html: `<div style="
    width:${size}px;height:${size}px;border-radius:50%;
    background:${color};border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
  "></div>`,
  className: '',
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
});

const gatheringMarker = createCircleIcon('#10b981', 20);
const destinationMarker = createCircleIcon('#ef4444', 20);
const userLocationMarker = createCircleIcon('#3b82f6', 16);

// Reverse geocode using Nominatim
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address;
    const parts = [addr?.road, addr?.suburb, addr?.city || addr?.town || addr?.village].filter(Boolean);
    return parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || '';
  } catch {
    return '';
  }
}

// Fetch real road route + distance from OSRM (free, no API key)
async function fetchRoute(
  start: [number, number],
  end: [number, number],
): Promise<{ points: [number, number][]; distanceKm: number }> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.[0]) {
      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]] as [number, number]
      );
      const distKm = Math.round((route.distance / 1000) * 10) / 10;
      return { points: coords, distanceKm: distKm };
    }
  } catch {
    // fallback
  }
  // Fallback: straight line + Haversine
  const R = 6371;
  const dLat = ((end[0] - start[0]) * Math.PI) / 180;
  const dLng = ((end[1] - start[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((start[0] * Math.PI) / 180) *
    Math.cos((end[0] * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return { points: [start, end], distanceKm: Math.round(R * c * 10) / 10 };
}

interface MapPickerProps {
  gatheringLat?: number;
  gatheringLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  onGatheringChange: (lat: number, lng: number, address?: string) => void;
  onDestinationChange: (lat: number, lng: number, address?: string) => void;
  useCurrentLocation?: boolean;
  onDistanceCalculated?: (distanceKm: number) => void;
}

function FitBounds({ gathering, destination }: {
  gathering?: [number, number];
  destination?: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    if (gathering && destination) {
      const bounds = L.latLngBounds([gathering, destination]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    } else if (gathering) {
      map.setView(gathering, 12);
    } else if (destination) {
      map.setView(destination, 12);
    }
  }, [gathering, destination, map]);
  return null;
}

function ClickHandler({ mode, onGatheringChange, onDestinationChange }: {
  mode: 'gathering' | 'destination';
  onGatheringChange: (lat: number, lng: number, address?: string) => void;
  onDestinationChange: (lat: number, lng: number, address?: string) => void;
}) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);
      if (mode === 'gathering') {
        onGatheringChange(lat, lng, address);
      } else {
        onDestinationChange(lat, lng, address);
      }
    },
  });
  return null;
}

// Component to center map on user location
function CenterOnLocation({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 13, { animate: true });
    }
  }, [position, map]);
  return null;
}

export default function MapPicker({
  gatheringLat,
  gatheringLng,
  destinationLat,
  destinationLng,
  onGatheringChange,
  onDestinationChange,
  useCurrentLocation = false,
  onDistanceCalculated,
}: MapPickerProps) {
  // ── Mounted guard: prevent Leaflet _leaflet_pos crash during SSR ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  const [mode, setMode] = useState<'gathering' | 'destination'>('gathering');
  const [routeData, setRouteData] = useState<{ points: [number, number][]; distanceKm: number } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const defaultCenter: [number, number] = [30.04, 31.24];

  const gatheringPos: [number, number] | undefined =
    gatheringLat && gatheringLng ? [gatheringLat, gatheringLng] : undefined;
  const destinationPos: [number, number] | undefined =
    destinationLat && destinationLng ? [destinationLat, destinationLng] : undefined;

  // GPS Detection — auto-detect user location on mount
  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGpsError('GPS not supported');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);
        setGpsLoading(false);

        // Cache in localStorage
        try {
          localStorage.setItem('lastKnownLocation', JSON.stringify({ lat, lng, ts: Date.now() }));
        } catch { }

        // If no gathering point set yet, auto-fill from GPS
        if (!gatheringLat && !gatheringLng) {
          const address = await reverseGeocode(lat, lng);
          onGatheringChange(lat, lng, address);
        }
      },
      (err) => {
        setGpsLoading(false);

        // Try cached location
        try {
          const cached = localStorage.getItem('lastKnownLocation');
          if (cached) {
            const { lat, lng } = JSON.parse(cached);
            setUserLocation([lat, lng]);
            return;
          }
        } catch { }

        setGpsError(err.code === 1 ? 'Location access denied' : 'Could not detect location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [gatheringLat, gatheringLng, onGatheringChange]);

  useEffect(() => {
    if (useCurrentLocation) {
      detectLocation();
    }
  }, [useCurrentLocation, detectLocation]);

  // Fetch route when both points are set
  useEffect(() => {
    if (gatheringPos && destinationPos) {
      let cancelled = false;
      setLoadingRoute(true);
      fetchRoute(gatheringPos, destinationPos).then((data) => {
        if (!cancelled) {
          setRouteData(data);
          setLoadingRoute(false);
          onDistanceCalculated?.(data.distanceKm);
        }
      });
      return () => { cancelled = true; };
    } else {
      setRouteData(null);
    }
  }, [gatheringLat, gatheringLng, destinationLat, destinationLng]);

  const mapCenter = gatheringPos || userLocation || defaultCenter;

  if (!mounted) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Mode Toggle + Distance + GPS Button */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setMode('gathering')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
            mode === 'gathering'
              ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/30 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Gathering
        </button>
        <button
          type="button"
          onClick={() => setMode('destination')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
            mode === 'destination'
              ? 'bg-red-100 text-red-700 ring-2 ring-red-500/30 dark:bg-red-900/40 dark:text-red-300'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Destination
        </button>

        {/* Use My Location button */}
        <button
          type="button"
          onClick={detectLocation}
          disabled={gpsLoading}
          className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 transition-all hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-300"
        >
          {gpsLoading ? (
            <span className="h-2 w-2 animate-spin rounded-full border border-blue-500 border-t-transparent" />
          ) : (
            <span className="text-xs">📍</span>
          )}
          {gpsLoading ? 'Detecting...' : 'My Location'}
        </button>

        {loadingRoute && (
          <span className="ml-auto text-[10px] text-zinc-400 animate-pulse">Calculating route...</span>
        )}
        {routeData && !loadingRoute && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            🛣️ {routeData.distanceKm} km (road)
          </span>
        )}
      </div>

      {/* GPS Error */}
      {gpsError && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          ⚠️ {gpsError} — tap map to set location manually
        </p>
      )}

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-700" style={{ height: '280px' }}>
        <MapContainer
          center={mapCenter}
          zoom={useCurrentLocation && userLocation ? 13 : 7}
          className="h-full w-full"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler
            mode={mode}
            onGatheringChange={onGatheringChange}
            onDestinationChange={onDestinationChange}
          />
          <FitBounds gathering={gatheringPos} destination={destinationPos} />
          {/* Center on user location when first detected */}
          {userLocation && !gatheringPos && !destinationPos && (
            <CenterOnLocation position={userLocation} />
          )}
          {/* User location dot */}
          {userLocation && !gatheringPos && (
            <Marker position={userLocation} icon={userLocationMarker} />
          )}
          {gatheringPos && <Marker position={gatheringPos} icon={gatheringMarker} />}
          {destinationPos && <Marker position={destinationPos} icon={destinationMarker} />}
          {routeData && routeData.points.length > 0 && (
            <>
              <Polyline positions={routeData.points} pathOptions={{ color: '#000', weight: 6, opacity: 0.06 }} />
              <Polyline positions={routeData.points} pathOptions={{ color: '#4f46e5', weight: 4, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Helper text */}
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
        Tap the map to place the{' '}
        <span className={mode === 'gathering' ? 'font-bold text-emerald-600' : 'font-bold text-red-600'}>
          {mode === 'gathering' ? 'gathering point' : 'destination'}
        </span>
        {' '}— route follows actual roads
      </p>
    </div>
  );
}
