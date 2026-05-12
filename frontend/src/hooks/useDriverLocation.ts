'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { useAuthStore } from '@/stores/useAuthStore';

interface UseDriverLocationOptions {
  /** Trip ID to track */
  tripId: string;
  /** Whether the current user is the driver of this trip */
  isDriver: boolean;
  /** Whether the trip is currently IN_PROGRESS */
  isInProgress: boolean;
  /** Update interval in milliseconds (default: 5000 = 5 seconds) */
  intervalMs?: number;
}

interface DriverLocationUpdate {
  tripId: string;
  lat: number;
  lng: number;
}

/**
 * Hook for driver live location tracking.
 *
 * For DRIVERS: Uses `navigator.geolocation.watchPosition` to track the driver's
 * position and emits updates via WebSocket every `intervalMs` milliseconds.
 *
 * For PASSENGERS: Listens for `driverLocation` WebSocket events to receive
 * the driver's live position.
 *
 * @returns The driver's latest location, or null if not yet available.
 */
export function useDriverLocation({
  tripId,
  isDriver,
  isInProgress,
  intervalMs = 5000,
}: UseDriverLocationOptions): DriverLocationUpdate | null {
  const { socket } = useSocket();
  const { isAuthenticated } = useAuthStore();
  const watchIdRef = useRef<number | null>(null);
  const lastEmitRef = useRef<number>(0);
  const locationRef = useRef<DriverLocationUpdate | null>(null);

  // Use a ref + state pattern so we don't cause excessive re-renders
  const [location, setLocation] = useState<DriverLocationUpdate | null>(null);

  // ── Driver: broadcast location ──
  useEffect(() => {
    if (!isDriver || !isInProgress || !socket || !isAuthenticated) return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        // Throttle emissions to the configured interval
        if (now - lastEmitRef.current < intervalMs) return;
        lastEmitRef.current = now;

        const update: DriverLocationUpdate = {
          tripId,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Emit to server
        socket.emit('driverLocation', update);

        // Also update local state for the driver's own map
        locationRef.current = update;
        setLocation(update);
      },
      (error) => {
        console.warn('[useDriverLocation] GPS error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: intervalMs,
      },
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isDriver, isInProgress, socket, isAuthenticated, tripId, intervalMs]);

  // ── Passenger: listen for driver location updates ──
  useEffect(() => {
    if (isDriver || !isInProgress || !socket) return;

    const handleDriverLocation = (data: DriverLocationUpdate) => {
      if (data.tripId === tripId) {
        locationRef.current = data;
        setLocation(data);
      }
    };

    socket.on('driverLocation', handleDriverLocation);

    return () => {
      socket.off('driverLocation', handleDriverLocation);
    };
  }, [isDriver, isInProgress, socket, tripId]);

  return location;
}
