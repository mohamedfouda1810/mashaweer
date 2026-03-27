'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    // If we're not logged in, or if we're in Vercel production where sockets are disabled, skip connection
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

  // Auto-subscribe to Web Push Notifications on login
  useEffect(() => {
    if (!user?.id) return;
    if (!isPushSupported()) return;

    // Delay slightly to avoid blocking initial render
    const timer = setTimeout(() => {
      subscribeToPush().catch(() => {});
    }, 3000);

    return () => clearTimeout(timer);
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
