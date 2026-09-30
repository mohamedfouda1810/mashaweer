'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { useSocket } from '@/providers/SocketProvider';
import { Notification } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
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
    const isRefreshingRef = useRef(false);
    const { t } = useTranslation();

    const fetchNotifications = useCallback(async () => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;
        setIsLoading(true);
        try {
            const res = await api.getNotifications(page);
            setNotifications((res.data as Notification[]) || []);
        } catch {
            // ignore
        } finally {
            setIsLoading(false);
            isRefreshingRef.current = false;
        }
    }, [page]);

    useEffect(() => {
        if (isAuthenticated) fetchNotifications();
    }, [isAuthenticated, fetchNotifications]);

    // Polling fallback — auto-refresh every 30s when socket is NOT connected
    useEffect(() => {
        if (isConnected || !isAuthenticated) return; // Socket handles it
        const refreshWhenVisible = () => {
            if (document.visibilityState === 'visible') fetchNotifications();
        };
        const interval = setInterval(refreshWhenVisible, 30000);
        return () => clearInterval(interval);
    }, [isConnected, isAuthenticated, fetchNotifications]);

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
                <div className="mb-8 flex items-center justify-between glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                            <Bell className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('notifications.title')}</h1>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {unread > 0 ? `${unread} ${t('notifications.subtitle')}` : t('notifications.emptyHint')}
                            </p>
                        </div>
                    </div>
                    {unread > 0 && (
                        <button
                            onClick={handleMarkAll}
                            className="btn-3d flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                        >
                            <CheckCheck className="h-4 w-4" />
                            {t('notifications.markAllRead')}
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl glass-card py-20 border border-emerald-500/20">
                        <BellOff className="h-12 w-12 text-emerald-500/50" />
                        <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('notifications.empty')}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{t('notifications.emptyHint')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`cursor-pointer rounded-xl glass-card p-4 transition-all hover-lift ${n.isRead
                                    ? 'border-zinc-200/50 bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-900/50'
                                    : 'border-emerald-500/30 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${n.isRead ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-emerald-100 dark:bg-emerald-900/50'}`}>
                                        {NOTIFICATION_ICONS[n.type] || <Bell className={`h-4 w-4 ${n.isRead ? 'text-zinc-400' : 'text-emerald-500'}`} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className={`text-sm font-semibold ${n.isRead ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                {n.title}
                                            </h3>
                                            <span className="text-xs text-zinc-500 font-medium">
                                                {new Date(n.createdAt).toLocaleDateString('en-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{n.message}</p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                                    )}
                                    <button
                                        onClick={(e) => handleDelete(e, n.id)}
                                        className="mt-1 flex-shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors dark:hover:bg-red-900/20"
                                        title="Delete notification"
                                    >
                                        <Trash2 className="h-4 w-4" />
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
