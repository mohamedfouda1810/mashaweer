'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    } else if (points.length === 1) {
      map.setView(points[0], 12);
    }
  }, [points, map]);
  return null;
}

interface TripMapProps {
  gatheringLat?: number;
  gatheringLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  distanceKm?: number;
  height?: string;
  compact?: boolean;
}

export default function TripMap({
  gatheringLat,
  gatheringLng,
  destinationLat,
  destinationLng,
  distanceKm,
  height = '180px',
  compact = true,
}: TripMapProps) {
  const hasGathering = gatheringLat !== undefined && gatheringLng !== undefined
    && gatheringLat !== null && gatheringLng !== null;
  const hasDestination = destinationLat !== undefined && destinationLng !== undefined
    && destinationLat !== null && destinationLng !== null;

  if (!hasGathering && !hasDestination) return null;

  const gatheringPos: [number, number] | undefined = hasGathering
    ? [gatheringLat!, gatheringLng!] : undefined;
  const destinationPos: [number, number] | undefined = hasDestination
    ? [destinationLat!, destinationLng!] : undefined;

  const points = [gatheringPos, destinationPos].filter(Boolean) as [number, number][];
  const center = points[0] || [30.04, 31.24];

  return (
    <div className="relative overflow-hidden rounded-xl" style={{ height }}>
      <MapContainer
        center={center}
        zoom={10}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
        zoomControl={!compact}
        dragging={!compact}
        scrollWheelZoom={!compact}
        doubleClickZoom={!compact}
        touchZoom={!compact}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds points={points} />
        {gatheringPos && <Marker position={gatheringPos} icon={greenIcon} />}
        {destinationPos && <Marker position={destinationPos} icon={redIcon} />}
        {gatheringPos && destinationPos && (
          <Polyline
            positions={[gatheringPos, destinationPos]}
            pathOptions={{ color: '#6366f1', weight: 3, dashArray: '8 8', opacity: 0.7 }}
          />
        )}
      </MapContainer>

      {/* Distance Badge */}
      {distanceKm && (
        <div className="absolute bottom-2 right-2 z-[1000] flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-md backdrop-blur-sm dark:bg-zinc-900/90 dark:text-indigo-300">
          📏 {distanceKm} km
        </div>
      )}
    </div>
  );
}
