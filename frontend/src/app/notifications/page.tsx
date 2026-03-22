'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { useSocket } from '@/providers/SocketProvider';
import { Notification } from '@/types';
import {
    Bell,
    BellOff,
    CheckCheck,
    Loader2,
    Ticket,
    CreditCard,
    AlertTriangle,
    Star,
    Car,
    ShieldAlert,
    Wifi,
    WifiOff,
    Trash2,
    DollarSign,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
    BOOKING_CONFIRMED: <Ticket className="h-4 w-4 text-emerald-500" />,
    BOOKING_CANCELLED: <Ticket className="h-4 w-4 text-red-500" />,
    TRIP_REMINDER: <Car className="h-4 w-4 text-teal-500" />,
    WAITLIST_PROMOTED: <Ticket className="h-4 w-4 text-teal-500" />,
    DEPOSIT_APPROVED: <CreditCard className="h-4 w-4 text-emerald-500" />,
    DEPOSIT_REJECTED: <CreditCard className="h-4 w-4 text-red-500" />,
    DRIVER_ALERT: <AlertTriangle className="h-4 w-4 text-orange-500" />,
    RATING_RECEIVED: <Star className="h-4 w-4 text-teal-500" />,
    ACCOUNT_BANNED: <ShieldAlert className="h-4 w-4 text-red-500" />,
    COMMISSION_ADDED: <DollarSign className="h-4 w-4 text-amber-500" />,
    COMMISSION_PAYMENT_APPROVED: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    COMMISSION_PAYMENT_REJECTED: <XCircle className="h-4 w-4 text-red-500" />,
};

export default function NotificationsPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.getNotifications(page);
            setNotifications((res.data as Notification[]) || []);
        } catch {
            // ignore
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        if (isAuthenticated) fetchNotifications();
    }, [isAuthenticated, fetchNotifications]);

    // Real-time WebSocket listener — new notifications appear instantly
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: Notification) => {
            setNotifications((prev) => {
                // Avoid duplicates
                if (prev.some((n) => n.id === notification.id)) return prev;
                return [notification, ...prev];
            });
        };

        socket.on('newNotification', handleNewNotification);

        return () => {
            socket.off('newNotification', handleNewNotification);
        };
    }, [socket]);

    const handleMarkRead = async (id: string) => {
        await api.markAsRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await api.deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch {
            // ignore
        }
    };

    const handleNotificationClick = async (n: Notification) => {
        // Mark as read
        if (!n.isRead) {
            await api.markAsRead(n.id);
            setNotifications((prev) =>
                prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
            );
        }

        // Navigate based on type and metadata
        const meta = n.metadata as Record<string, any> | undefined;
        const tripId = meta?.tripId;
        const bookingId = meta?.bookingId;

        switch (n.type) {
            case 'BOOKING_CONFIRMED':
            case 'BOOKING_CANCELLED':
            case 'WAITLIST_PROMOTED':
                if (tripId) router.push(`/trips/${tripId}`);
                else router.push('/bookings');
                break;
            case 'TRIP_REMINDER':
            case 'TRIP_UPDATE':
            case 'DRIVER_ALERT':
                // Admins go to admin dashboard for alerts; drivers/passengers go to trip
                if (n.type === 'DRIVER_ALERT' && user?.role === 'ADMIN') {
                    router.push('/admin');
                } else if (tripId) {
                    router.push(`/trips/${tripId}`);
                }
                break;
            case 'DEPOSIT_APPROVED':
            case 'DEPOSIT_REJECTED':
            case 'COMMISSION_ADDED':
            case 'COMMISSION_PAYMENT_APPROVED':
            case 'COMMISSION_PAYMENT_REJECTED':
                router.push('/wallet');
                break;
            case 'RATING_RECEIVED':
                if (tripId) router.push(`/trips/${tripId}`);
                break;
            case 'ACCOUNT_BANNED':
            case 'DRIVER_APPROVED':
            case 'DRIVER_DECLINED':
                // Stay on current page or go home
                break;
            default:
                if (tripId) router.push(`/trips/${tripId}`);
                break;
        }
    };

    const handleMarkAll = async () => {
        await api.markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const unread = notifications.filter((n) => !n.isRead).length;

    return (
        <ProtectedRoute>
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                            <Bell className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Notifications</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {unread > 0 ? `${unread} unread` : 'All caught up!'}
                                </p>
                                <span className="inline-flex items-center gap-1 text-xs">
                                    {isConnected ? (
                                        <><Wifi className="h-3 w-3 text-emerald-500" /><span className="text-emerald-500">Live</span></>
                                    ) : (
                                        <><WifiOff className="h-3 w-3 text-zinc-400" /><span className="text-zinc-400">Offline</span></>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                    {unread > 0 && (
                        <button
                            onClick={handleMarkAll}
                            className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-20 dark:border-zinc-800">
                        <BellOff className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                        <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">No notifications</h3>
                        <p className="mt-1 text-sm text-zinc-500">You&apos;re all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`cursor-pointer rounded-xl border p-4 transition-all ${n.isRead
                                    ? 'border-zinc-100 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/70'
                                    : 'border-teal-200 bg-teal-50/50 hover:bg-teal-50 dark:border-teal-800/50 dark:bg-teal-950/20 dark:hover:bg-teal-950/30'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        {NOTIFICATION_ICONS[n.type] || <Bell className="h-4 w-4 text-zinc-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className={`text-sm font-semibold ${n.isRead ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                {n.title}
                                            </h3>
                                            <span className="text-xs text-zinc-400">
                                                {new Date(n.createdAt).toLocaleDateString('en-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{n.message}</p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-teal-500 animate-pulse" />
                                    )}
                                    <button
                                        onClick={(e) => handleDelete(e, n.id)}
                                        className="mt-0.5 flex-shrink-0 rounded-lg p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors dark:hover:bg-red-900/20"
                                        title="Delete notification"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
