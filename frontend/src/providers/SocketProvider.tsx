'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/useAuthStore';
import { subscribeToPush, isPushSupported } from '@/lib/pushNotifications';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

/**
 * Detect if we're running inside an in-app browser (Instagram, Facebook, etc.)
 * These WebViews often restrict Service Workers and push notifications.
 */
function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Line\/|Twitter|MicroMessenger|Snapchat/i.test(ua);
}

/**
 * SocketProvider — handles real-time WebSocket + polling fallback.
 * WebSocket is enabled in all environments for the group chat feature.
 */
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuthStore();

  useEffect(() => {
    let active = true;

    void Promise.resolve(useAuthStore.persist.rehydrate()).finally(() => {
      if (active) useAuthStore.setState({ hasHydrated: true });
    });

    return () => {
      active = false;
    };
  }, []);

  // Auto-subscribe to Web Push Notifications on login
  // Skip in WebViews where service workers are often blocked
  useEffect(() => {
    if (!user?.id) return;
    if (!isPushSupported()) return;
    if (isInAppBrowser()) return; // Don't attempt push in Instagram/Facebook WebViews

    const timer = setTimeout(() => {
      subscribeToPush().catch(() => {
        // Push subscription failed — non-critical, ignore silently
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [user?.id]);

  // Socket.IO requires a persistent server. The API deployment is serverless,
  // so only connect when a dedicated realtime endpoint is explicitly supplied.
  // All features retain their HTTP polling fallback when it is unavailable.
  useEffect(() => {
    const realtimeUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!user?.id || !token || !realtimeUrl) {
      setSocket((currentSocket) => {
        currentSocket?.disconnect();
        return null;
      });
      setIsConnected(false);
      return;
    }

    const socketInstance = io(realtimeUrl.replace(/\/api\/?$/, ''), {
      // Pass JWT token for authentication (needed for chat)
      auth: { token },
      transports: ['websocket'],
      timeout: 5_000,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket((currentSocket) => currentSocket === socketInstance ? null : currentSocket);
      setIsConnected(false);
    };
  }, [user?.id, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Hook for polling-based notification count updates.
 * Used in components that need real-time unread count (e.g., Navbar badge).
 * Falls back to polling when WebSocket is not available (production).
 *
 * FIXED: Uses the api client instead of raw fetch + wrong localStorage key.
 */
export function useNotificationPolling(intervalMs: number = 30000) {
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUnread = useCallback(async () => {
    if (!user?.id) return;
    try {
      // Use the API client which already has the correct token
      const { api } = await import('@/lib/api');
      const res = await api.getUnreadCount();
      setUnreadCount(res.data?.count ?? 0);
    } catch {
      // Non-critical — silently fail
    }
  }, [user?.id]);

  useEffect(() => {
    // If socket is connected, listen for real-time updates
    if (socket && isConnected) {
      const handleNew = () => setUnreadCount((c) => c + 1);
      socket.on('newNotification', handleNew);
      // Initial fetch
      fetchUnread();
      return () => { socket.off('newNotification', handleNew); };
    }

    // Otherwise, poll every intervalMs
    if (user?.id) {
      fetchUnread();
      intervalRef.current = setInterval(fetchUnread, intervalMs);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [socket, isConnected, user?.id, intervalMs, fetchUnread]);

  return { unreadCount, refetch: fetchUnread };
}
