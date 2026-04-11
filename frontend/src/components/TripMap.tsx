'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom circle markers instead of default pins — cleaner look
const createCircleIcon = (color: string, size: number = 14) => L.divIcon({
  html: `<div style="
    width:${size}px;height:${size}px;border-radius:50%;
    background:${color};border:3px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,0.35);
  "></div>`,
  className: '',
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
});

const gatheringIcon = createCircleIcon('#10b981', 16); // emerald
const destinationIcon = createCircleIcon('#ef4444', 16); // red

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    } else if (points.length === 1) {
      map.setView(points[0], 12);
    }
  }, [points, map]);
  return null;
}

// Generate a curved path between two points for a nicer visual
function getCurvedPath(
  start: [number, number],
  end: [number, number],
  numPoints: number = 30,
): [number, number][] {
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  // Offset perpendicular to the line for curve
  const dLat = end[0] - start[0];
  const dLng = end[1] - start[1];
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  const offset = dist * 0.15; // 15% curve
  const controlLat = midLat + (dLng / dist) * offset;
  const controlLng = midLng - (dLat / dist) * offset;

  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat =
      (1 - t) * (1 - t) * start[0] +
      2 * (1 - t) * t * controlLat +
      t * t * end[0];
    const lng =
      (1 - t) * (1 - t) * start[1] +
      2 * (1 - t) * t * controlLng +
      t * t * end[1];
    points.push([lat, lng]);
  }
  return points;
}

interface TripMapProps {
  gatheringLat?: number;
  gatheringLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  distanceKm?: number;
  height?: string;
  compact?: boolean;
  fromLabel?: string;
  toLabel?: string;
}

export default function TripMap({
  gatheringLat,
  gatheringLng,
  destinationLat,
  destinationLng,
  distanceKm,
  height = '180px',
  compact = true,
  fromLabel,
  toLabel,
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

  const curvedPath = gatheringPos && destinationPos
    ? getCurvedPath(gatheringPos, destinationPos)
    : null;

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
        
        {/* Route line — curved for visual appeal */}
        {curvedPath && (
          <>
            {/* Shadow line */}
            <Polyline
              positions={curvedPath}
              pathOptions={{ color: '#000', weight: 5, opacity: 0.08 }}
            />
            {/* Main gradient-like line */}
            <Polyline
              positions={curvedPath}
              pathOptions={{ color: '#6366f1', weight: 3, opacity: 0.8 }}
            />
          </>
        )}
        
        {/* Markers */}
        {gatheringPos && (
          <Marker position={gatheringPos} icon={gatheringIcon}>
            {!compact && fromLabel && <Popup>{fromLabel}</Popup>}
          </Marker>
        )}
        {destinationPos && (
          <Marker position={destinationPos} icon={destinationIcon}>
            {!compact && toLabel && <Popup>{toLabel}</Popup>}
          </Marker>
        )}
      </MapContainer>

      {/* Distance Badge — improved design */}
      {distanceKm && (
        <div className="absolute bottom-2 right-2 z-[1000] flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 shadow-lg ring-1 ring-black/5 backdrop-blur-sm dark:bg-zinc-900/95 dark:ring-white/10">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
            <span className="text-[8px]">📏</span>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
            {distanceKm} km
          </span>
        </div>
      )}

      {/* Labels overlay for compact mode */}
      {compact && (fromLabel || toLabel) && (
        <div className="absolute top-2 left-2 z-[1000] flex flex-col gap-1">
          {fromLabel && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {fromLabel}
            </span>
          )}
          {toLabel && (
            <span className="flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {toLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
