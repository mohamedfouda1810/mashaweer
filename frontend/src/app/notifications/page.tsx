'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
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
} from 'lucide-react';

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
    BOOKING_CONFIRMED: <Ticket className="h-4 w-4 text-emerald-500" />,
    BOOKING_CANCELLED: <Ticket className="h-4 w-4 text-red-500" />,
    TRIP_REMINDER: <Car className="h-4 w-4 text-blue-500" />,
    WAITLIST_PROMOTED: <Ticket className="h-4 w-4 text-amber-500" />,
    DEPOSIT_APPROVED: <CreditCard className="h-4 w-4 text-emerald-500" />,
    DEPOSIT_REJECTED: <CreditCard className="h-4 w-4 text-red-500" />,
    DRIVER_ALERT: <AlertTriangle className="h-4 w-4 text-orange-500" />,
    RATING_RECEIVED: <Star className="h-4 w-4 text-amber-500" />,
    ACCOUNT_BANNED: <ShieldAlert className="h-4 w-4 text-red-500" />,
};

export default function NotificationsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
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

    const handleMarkRead = async (id: string) => {
        await api.markAsRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
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
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {unread > 0 ? `${unread} unread` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                    {unread > 0 && (
                        <button
                            onClick={handleMarkAll}
                            className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                                onClick={() => !n.isRead && handleMarkRead(n.id)}
                                className={`cursor-pointer rounded-xl border p-4 transition-all ${n.isRead
                                    ? 'border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                                    : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-800/50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'
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
                                        <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
