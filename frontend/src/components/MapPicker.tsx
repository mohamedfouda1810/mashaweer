'use client';

import React, { useState, useEffect } from 'react';
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

export default function MapPicker({
  gatheringLat,
  gatheringLng,
  destinationLat,
  destinationLng,
  onGatheringChange,
  onDestinationChange,
}: MapPickerProps) {
  const [mode, setMode] = useState<'gathering' | 'destination'>('gathering');
  const [routeData, setRouteData] = useState<{ points: [number, number][]; distanceKm: number } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const defaultCenter: [number, number] = [30.04, 31.24];

  const gatheringPos: [number, number] | undefined =
    gatheringLat && gatheringLng ? [gatheringLat, gatheringLng] : undefined;
  const destinationPos: [number, number] | undefined =
    destinationLat && destinationLng ? [destinationLat, destinationLng] : undefined;

  // Fetch route when both points are set
  useEffect(() => {
    if (gatheringPos && destinationPos) {
      let cancelled = false;
      setLoadingRoute(true);
      fetchRoute(gatheringPos, destinationPos).then((data) => {
        if (!cancelled) {
          setRouteData(data);
          setLoadingRoute(false);
        }
      });
      return () => { cancelled = true; };
    } else {
      setRouteData(null);
    }
  }, [gatheringLat, gatheringLng, destinationLat, destinationLng]);

  return (
    <div className="space-y-2">
      {/* Mode Toggle + Distance */}
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
        {loadingRoute && (
          <span className="ml-auto text-[10px] text-zinc-400 animate-pulse">Calculating route...</span>
        )}
        {routeData && !loadingRoute && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            🛣️ {routeData.distanceKm} km (road)
          </span>
        )}
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-700" style={{ height: '280px' }}>
        <MapContainer
          center={gatheringPos || defaultCenter}
          zoom={7}
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
