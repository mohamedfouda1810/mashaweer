'use client';

import React, { useEffect } from 'react';
import { useTripStore } from '@/stores/useTripStore';
import { TripCard } from './TripCard';
import { TripFilters } from './TripFilters';
import { Loader2, MapPinOff, ChevronLeft, ChevronRight } from 'lucide-react';

interface TripListProps {
    onBook?: (tripId: string) => void;
    onViewDetails?: (tripId: string) => void;
}

export function TripList({ onBook, onViewDetails }: TripListProps) {
    const { trips, isLoading, error, meta, fetchTrips, setPage } = useTripStore();

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <TripFilters />

            {/* Results Count */}
            {meta && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Showing{' '}
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {trips.length}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {meta.total}
                        </span>{' '}
                        trips
                    </p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                        Finding trips for you...
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    <button
                        onClick={fetchTrips}
                        className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && trips.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-20 dark:border-zinc-800">
                    <MapPinOff className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                    <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        No trips found
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Try adjusting your filters or check back later
                    </p>
                </div>
            )}

            {/* Trip Cards Grid */}
            {!isLoading && trips.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {trips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            trip={trip}
                            onBook={onBook}
                            onViewDetails={onViewDetails}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => setPage(meta.page - 1)}
                        disabled={meta.page <= 1}
                        className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>
                    <div className="flex items-center gap-1">
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
                                        className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${page === meta.page
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
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
                        className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
