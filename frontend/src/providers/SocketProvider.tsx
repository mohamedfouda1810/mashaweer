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
 * SocketProvider — handles real-time WebSocket + polling fallback.
 * In production (Vercel), WebSocket is disabled but we poll for notifications.
 */
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();

  // Auto-subscribe to Web Push Notifications on login
  useEffect(() => {
    if (!user?.id) return;
    if (!isPushSupported()) return;

    const timer = setTimeout(() => {
      subscribeToPush().catch(() => {});
    }, 3000);

    return () => clearTimeout(timer);
  }, [user?.id]);

  // ── WebSocket connection (dev/staging only) ──
  useEffect(() => {
    if (!user?.id || process.env.NODE_ENV === 'production') {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const socketInstance = io(API_URL, {
      query: { userId: user.id },
      transports: ['polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id]);

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
 */
export function useNotificationPolling(intervalMs: number = 30000) {
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUnread = useCallback(async () => {
    if (!user?.id) return;
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data?.data?.count ?? 0);
      }
    } catch {
      // silently fail
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
