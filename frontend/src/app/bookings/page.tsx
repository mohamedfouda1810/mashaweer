'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { QRCodeDisplay } from '@/components/passenger/QRCodeDisplay';
import { useTranslation } from '@/hooks/useTranslation';

import {
    Ticket,
    Calendar,
    MapPin,
    Loader2,
    XCircle,
    Clock,
    CheckCircle2,
    ChevronRight,
    QrCode,
    X,
    ShieldCheck
} from 'lucide-react';

export default function BookingsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { bookings, isLoading, error, fetchBookings, cancelBooking } = useBookingStore();
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [refundInfo, setRefundInfo] = useState<{ amount: number } | null>(null);
    const [qrModal, setQrModal] = useState<{
        bookingId: string;
        tripId: string;
        boardingToken: string;
    } | null>(null);
    const { t, formatDate, formatTime } = useTranslation();

    useEffect(() => {
        if (isAuthenticated) fetchBookings();
    }, [isAuthenticated, fetchBookings]);

    const handleCancel = async (bookingId: string) => {
        if (!confirm(t('bookings.confirmCancel'))) return;
        setCancellingId(bookingId);
        const result = await cancelBooking(bookingId);
        if (result) {
            setRefundInfo({ amount: result.refundAmount });
            fetchBookings();
        }
        setCancellingId(null);
    };

    const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
        PENDING: { icon: <Clock className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50' },
        CONFIRMED: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' },
        COMPLETED: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' },
        CANCELLED: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50' },
    };

    return (
        <ProtectedRoute>
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/50 backdrop-blur-md shadow-sm border border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-900/50">
                            <Ticket className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('bookings.title')}</h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{t('bookings.subtitle')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        <ShieldCheck className="h-4 w-4" />
                        🛡️ Safe Booking
                    </div>
                </div>

                {refundInfo && (
                    <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 glass-card">
                        {t('bookings.refund')} <strong>{refundInfo.amount} EGP</strong> {t('bookings.refundSuffix')}
                        <button onClick={() => setRefundInfo(null)} className="mx-2 underline font-medium">{t('common.close')}</button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200/50 bg-white/50 backdrop-blur-sm py-20 dark:border-emerald-800/30 dark:bg-slate-900/50">
                        <Ticket className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('bookings.empty')}</h3>
                        <p className="mt-1 text-sm text-slate-500">{t('bookings.emptyHint')}</p>
                        <button
                            onClick={() => router.push('/trips')}
                            className="mt-4 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {t('nav.trips')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const trip = booking.trip;
                            const departure = new Date(trip.departureTime);
                            const sc = statusConfig[booking.status] || statusConfig.PENDING;
                            const canShowQR =
                                (booking.status === 'CONFIRMED' || booking.status === 'PENDING') &&
                                booking.boardingToken;

                            return (
                                <div
                                    key={booking.id}
                                    className="group glass-card hover-lift"
                                >
                                    <div className="flex items-start justify-between p-5">
                                        <div className="flex-1">
                                            {/* Route */}
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                    {trip.fromCity} → {trip.toCity}
                                                </h3>
                                                <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${sc.color}`}>
                                                    {sc.icon}
                                                    {t(`bookings.status.${booking.status}` as any)}
                                                </span>
                                            </div>

                                            {/* Details */}
                                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4 text-slate-400" />
                                                    {formatDate(departure)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4 text-slate-400" />
                                                    {formatTime(departure)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4 text-slate-400" />
                                                    {trip.gatheringLocation}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex items-center gap-2 text-sm">
                                                <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    {booking.seats} seat(s)
                                                </span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                    {Math.round((trip.pricePerSeat ? Number(trip.pricePerSeat) : Number(trip.price) / trip.totalSeats) * booking.seats)} EGP
                                                </span>
                                            </div>

                                            {/* QR inline preview for confirmed bookings */}
                                            {canShowQR && booking.boardingToken && (
                                                <button
                                                    onClick={() =>
                                                        setQrModal({
                                                            bookingId: booking.id,
                                                            tripId: booking.tripId,
                                                            boardingToken: booking.boardingToken!,
                                                        })
                                                    }
                                                    className="mt-4 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:shadow-md dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                                >
                                                    <QrCode className="h-4 w-4" />
                                                    {t('bookings.showQR')}
                                                </button>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                                            {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    disabled={cancellingId === booking.id}
                                                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                                >
                                                    {cancellingId === booking.id ? t('bookings.cancelling') : t('bookings.cancel')}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => router.push(`/trips/${trip.id}`)}
                                                className="flex items-center justify-center rounded-xl bg-slate-50 p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                            >
                                                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* QR Modal */}
            {qrModal && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
                    onClick={() => setQrModal(null)}
                >
                    <div
                        className="w-full max-w-sm overflow-hidden rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur-xl animate-scale-in dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-700/50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                                    <QrCode className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('bookings.qrTitle')}</h2>
                            </div>
                            <button
                                onClick={() => setQrModal(null)}
                                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="mb-6 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                            {t('bookings.qrInstruction')}
                        </p>
                        <div className="flex justify-center rounded-2xl bg-white p-4 shadow-inner dark:bg-white/10">
                            <QRCodeDisplay
                                bookingId={qrModal.bookingId}
                                tripId={qrModal.tripId}
                                boardingToken={qrModal.boardingToken}
                            />
                        </div>
                        <button
                            onClick={() => setQrModal(null)}
                            className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {t('common.close')}
                        </button>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
