'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with webpack/next.js
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPickerProps {
  gatheringLat?: number;
  gatheringLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  onGatheringChange: (lat: number, lng: number, address?: string) => void;
  onDestinationChange: (lat: number, lng: number, address?: string) => void;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Reverse geocode using Nominatim (free, no API key)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address;
    // Build readable address
    const parts = [addr?.road, addr?.suburb, addr?.city || addr?.town || addr?.village].filter(Boolean);
    return parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || '';
  } catch {
    return '';
  }
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

  // Egypt center (Cairo)
  const defaultCenter: [number, number] = [30.04, 31.24];

  const gatheringPos: [number, number] | undefined =
    gatheringLat && gatheringLng ? [gatheringLat, gatheringLng] : undefined;
  const destinationPos: [number, number] | undefined =
    destinationLat && destinationLng ? [destinationLat, destinationLng] : undefined;

  const distance =
    gatheringPos && destinationPos
      ? calculateDistance(gatheringPos[0], gatheringPos[1], destinationPos[0], destinationPos[1])
      : null;

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('gathering')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
            mode === 'gathering'
              ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/30 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Set Gathering Point
        </button>
        <button
          type="button"
          onClick={() => setMode('destination')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
            mode === 'destination'
              ? 'bg-red-100 text-red-700 ring-2 ring-red-500/30 dark:bg-red-900/40 dark:text-red-300'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Set Destination
        </button>
        {distance !== null && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            📏 {distance} km
          </span>
        )}
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-700" style={{ height: '320px' }}>
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
          {gatheringPos && <Marker position={gatheringPos} icon={greenIcon} />}
          {destinationPos && <Marker position={destinationPos} icon={redIcon} />}
          {gatheringPos && destinationPos && (
            <Polyline
              positions={[gatheringPos, destinationPos]}
              pathOptions={{ color: '#6366f1', weight: 3, dashArray: '8 8', opacity: 0.7 }}
            />
          )}
        </MapContainer>
      </div>

      {/* Helper text */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Click on the map to set the{' '}
        <span className={mode === 'gathering' ? 'font-bold text-emerald-600' : 'font-bold text-red-600'}>
          {mode === 'gathering' ? 'gathering point' : 'destination'}
        </span>
        . The address will be auto-filled.
      </p>
    </div>
  );
}
