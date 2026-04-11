'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom circle markers
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

const gatheringIcon = createCircleIcon('#10b981', 16);
const destinationIcon = createCircleIcon('#ef4444', 16);

// Fetch real road route from OSRM (free, no API key)
async function fetchRoute(
  start: [number, number],
  end: [number, number],
): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
      // OSRM returns [lng, lat], we need [lat, lng]
      return data.routes[0].geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]] as [number, number]
      );
    }
  } catch {
    // Fallback to straight line
  }
  return [start, end];
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    } else if (points.length === 1) {
      map.setView(points[0], 12);
    }
  }, [points, map]);
  return null;
}

// Component to fetch and display the road route
function RoadRoute({ start, end }: { start: [number, number]; end: [number, number] }) {
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchRoute(start, end).then((pts) => {
      if (!cancelled) setRoutePoints(pts);
    });
    return () => { cancelled = true; };
  }, [start[0], start[1], end[0], end[1]]);

  if (routePoints.length === 0) return null;

  return (
    <>
      {/* Shadow */}
      <Polyline
        positions={routePoints}
        pathOptions={{ color: '#000', weight: 6, opacity: 0.06 }}
      />
      {/* Main route */}
      <Polyline
        positions={routePoints}
        pathOptions={{ color: '#4f46e5', weight: 4, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
      />
    </>
  );
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
        
        {/* Road route following streets */}
        {gatheringPos && destinationPos && (
          <RoadRoute start={gatheringPos} end={destinationPos} />
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

      {/* Distance Badge */}
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
