'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTripStore } from '@/stores/useTripStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import { api, isAbortError } from '@/lib/api';
import { TripCard } from './TripCard';
import { TripFilters } from './TripFilters';
import { Booking } from '@/types';
import { Loader2, MapPinOff, ChevronLeft, ChevronRight, WifiOff, ServerCrash, RefreshCw } from 'lucide-react';

interface TripListProps {
    onBook?: (tripId: string) => void;
    onViewDetails?: (tripId: string) => void;
    hideBooking?: boolean;
}

export function TripList({ onBook, onViewDetails, hideBooking }: TripListProps) {
    const { trips, isLoading, error, errorKind, meta, fetchTrips, setPage, cancelPendingRequest } = useTripStore();
    const { isAuthenticated } = useAuthStore();
    const { t } = useTranslation();
    const [bookedTripIds, setBookedTripIds] = useState<Set<string>>(new Set());
    const hasFetched = useRef(false);

    // Fetch trips once on mount — stable ref prevents duplicate calls
    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            fetchTrips();
        }
        // Cancel any pending request when unmounting
        return () => {
            cancelPendingRequest();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch user's bookings to determine which trips are already booked
    useEffect(() => {
        if (!isAuthenticated || hideBooking) return;

        const controller = new AbortController();
        api.getMyBookings()
            .then((res) => {
                if (controller.signal.aborted) return;
                const bookings = (res.data || []) as Booking[];
                const ids = new Set<string>(
                    bookings
                        .filter((b) => b.status !== 'CANCELLED')
                        .map((b) => b.tripId)
                );
                setBookedTripIds(ids);
            })
            .catch((err) => {
                if (isAbortError(err)) return;
                // Non-critical — silently fail, user just won't see "already booked" badges
            });

        return () => controller.abort();
    }, [isAuthenticated, hideBooking]);

    // Error state icons and messages based on error kind
    const renderErrorState = () => {
        const isNetworkError = errorKind === 'network';
        const isServerError = errorKind === 'server';

        return (
            <div className="rounded-2xl glass-card border border-red-200/50 bg-red-50/50 backdrop-blur-md p-8 text-center shadow-sm dark:border-red-900/30 dark:bg-red-950/30">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-red-100 dark:bg-red-900/40 dark:border-red-800/50">
                    {isNetworkError ? (
                        <WifiOff className="h-7 w-7 text-red-500" />
                    ) : isServerError ? (
                        <ServerCrash className="h-7 w-7 text-red-500" />
                    ) : (
                        <ServerCrash className="h-7 w-7 text-red-500" />
                    )}
                </div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                    {isNetworkError
                        ? t('trips.networkError')
                        : isServerError
                            ? t('trips.serverError')
                            : error}
                </p>
                <button
                    onClick={fetchTrips}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-100 px-5 py-2.5 text-sm font-bold text-red-700 shadow-sm transition-all hover:bg-red-200 hover:shadow-md active:scale-95 dark:bg-red-900/60 dark:text-red-200 dark:hover:bg-red-800"
                >
                    <RefreshCw className="h-4 w-4" />
                    {t('common.tryAgain')}
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <TripFilters />

            {/* Results Count */}
            {meta && !isLoading && !error && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {t('trips.showing')}{' '}
                        <span className="font-bold text-navy dark:text-blue-400">
                            {trips.length}
                        </span>{' '}
                        {t('trips.of')}{' '}
                        <span className="font-bold text-navy dark:text-blue-400">
                            {meta.total}
                        </span>{' '}
                        {t('trips.tripsCount')}
                    </p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                    <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {t('trips.finding')}
                    </p>
                </div>
            )}

            {/* Error State */}
            {!isLoading && error && renderErrorState()}

            {/* Empty State */}
            {!isLoading && !error && trips.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-3xl glass-card border-2 border-dashed border-zinc-200/60 py-24 shadow-sm dark:border-zinc-800/60">
                    <div className="p-4 rounded-full bg-zinc-100/50 dark:bg-zinc-800/50 mb-4">
                        <MapPinOff className="h-12 w-12 text-zinc-400 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {t('trips.noTrips')}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {t('trips.noTripsHint')}
                    </p>
                </div>
            )}

            {/* Trip Cards Grid */}
            {!isLoading && !error && trips.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {trips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            trip={trip}
                            onBook={onBook}
                            onViewDetails={onViewDetails}
                            hideBooking={hideBooking}
                            isBooked={bookedTripIds.has(trip.id)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 pb-4">
                    <button
                        onClick={() => setPage(meta.page - 1)}
                        disabled={meta.page <= 1}
                        className="flex items-center gap-1 rounded-xl border border-zinc-200/80 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-700/80"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {t('common.previous')}
                    </button>
                    <div className="flex items-center gap-1.5 mx-2">
                        {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                            .filter(
                                (page) =>
                                    page === 1 ||
                                    page === meta.totalPages ||
                                    Math.abs(page - meta.page) <= 1,
                            )
                            .map((page, index, arr) => (
                                <React.Fragment key={page}>
                                    {index > 0 && arr[index - 1] !== page - 1 && (
                                        <span className="px-1 text-zinc-400">...</span>
                                    )}
                                    <button
                                        onClick={() => setPage(page)}
                                        className={`h-10 w-10 rounded-xl text-sm font-bold transition-all shadow-sm ${page === meta.page
                                            ? 'bg-navy text-white scale-110 shadow-md ring-2 ring-navy/20 dark:ring-navy/40'
                                            : 'bg-white/50 text-zinc-700 border border-zinc-200/80 hover:bg-zinc-100 hover:scale-105 dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-300 dark:hover:bg-zinc-700/80'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                </React.Fragment>
                            ))}
                    </div>
                    <button
                        onClick={() => setPage(meta.page + 1)}
                        disabled={meta.page >= meta.totalPages}
                        className="flex items-center gap-1 rounded-xl border border-zinc-200/80 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-700/80"
                    >
                        {t('common.next')}
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
