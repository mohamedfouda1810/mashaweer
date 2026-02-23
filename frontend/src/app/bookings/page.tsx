'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import {
    Ticket,
    Calendar,
    MapPin,
    Loader2,
    XCircle,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
} from 'lucide-react';

export default function BookingsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { bookings, isLoading, error, fetchBookings, cancelBooking } = useBookingStore();
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [refundInfo, setRefundInfo] = useState<{ amount: number } | null>(null);

    useEffect(() => {
        if (isAuthenticated) fetchBookings();
    }, [isAuthenticated, fetchBookings]);

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                <Ticket className="mb-4 h-12 w-12 text-zinc-300" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Sign in required</h2>
                <button onClick={() => router.push('/login')} className="mt-3 text-blue-600 hover:underline">
                    Go to login
                </button>
            </div>
        );
    }

    const handleCancel = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        setCancellingId(bookingId);
        const result = await cancelBooking(bookingId);
        if (result) {
            setRefundInfo({ amount: result.refundAmount });
            fetchBookings();
        }
        setCancellingId(null);
    };

    const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
        PENDING: { icon: <Clock className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
        CONFIRMED: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
        COMPLETED: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
        CANCELLED: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                    <Ticket className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Bookings</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage your trip reservations</p>
                </div>
            </div>

            {refundInfo && (
                <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                    Booking cancelled. Refund of <strong>{refundInfo.amount} EGP</strong> has been added to your wallet.
                    <button onClick={() => setRefundInfo(null)} className="ml-2 underline">Dismiss</button>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-20 dark:border-zinc-800">
                    <Ticket className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                    <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">No bookings yet</h3>
                    <p className="mt-1 text-sm text-zinc-500">Browse trips and book your first ride!</p>
                    <button
                        onClick={() => router.push('/trips')}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Browse Trips
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => {
                        const trip = booking.trip;
                        const departure = new Date(trip.departureTime);
                        const sc = statusConfig[booking.status] || statusConfig.PENDING;

                        return (
                            <div
                                key={booking.id}
                                className="group rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <div className="flex items-start justify-between p-5">
                                    <div className="flex-1">
                                        {/* Route */}
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                                {trip.fromCity} → {trip.toCity}
                                            </h3>
                                            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${sc.color}`}>
                                                {sc.icon}
                                                {booking.status}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {departure.toLocaleDateString('en-EG', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {departure.toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {trip.gatheringLocation}
                                            </span>
                                        </div>

                                        <div className="mt-2 text-sm">
                                            <span className="text-zinc-500">{booking.seats} seat(s) • </span>
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                {Number(trip.price) * booking.seats} EGP
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                            <button
                                                onClick={() => handleCancel(booking.id)}
                                                disabled={cancellingId === booking.id}
                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                                            >
                                                {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => router.push(`/trips/${trip.id}`)}
                                            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
