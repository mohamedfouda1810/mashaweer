'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Trip } from '@/types';
import { getImageUrl } from '@/lib/api';
import { useBookingStore } from '@/stores/useBookingStore';
import { useTranslation } from '@/hooks/useTranslation';
import {
    Clock,
    Users,
    Car,
    Navigation,
    CalendarDays,
} from 'lucide-react';

const TripMap = dynamic(() => import('@/components/TripMap'), {
    ssr: false,
    loading: () => <div className="h-[140px] rounded-xl bg-zinc-100 animate-pulse dark:bg-zinc-800" />,
});

interface TripCardProps {
    trip: Trip;
    onBook?: (tripId: string) => void;
    onViewDetails?: (tripId: string) => void;
    hideBooking?: boolean;
    isBooked?: boolean;
}

export function TripCard({ trip, onBook, onViewDetails, hideBooking, isBooked }: TripCardProps) {
    const { isBooking } = useBookingStore();
    const { t, formatDate, formatTime } = useTranslation();

    const formattedDateStr = formatDate(trip.departureTime);
    const formattedTimeStr = formatTime(trip.departureTime);

    const isFull = trip.availableSeats <= 0;
    const isConfirmed = trip.status === 'DRIVER_CONFIRMED';

    const hasMapData = (trip.gatheringLatitude && trip.gatheringLongitude) ||
        (trip.destinationLatitude && trip.destinationLongitude);

    return (
        <div className="group relative overflow-hidden rounded-2xl glass-card hover-lift shadow-sm transition-all duration-300">
            {/* Mini Map */}
            {hasMapData && (
                <TripMap
                    gatheringLat={trip.gatheringLatitude}
                    gatheringLng={trip.gatheringLongitude}
                    destinationLat={trip.destinationLatitude}
                    destinationLng={trip.destinationLongitude}
                    distanceKm={trip.distanceKm}
                    height="130px"
                    compact={true}
                    fromLabel={trip.fromCity}
                    toLabel={trip.toCity}
                />
            )}

            {/* Status Badge */}
            {isConfirmed && (
                <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-emerald-100/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t('trips.driverReady')}
                </div>
            )}

            {/* Driver Section */}
            <div className="flex items-center gap-3 border-b border-zinc-100/50 p-4 dark:border-zinc-800/50">
                <div className="relative h-12 w-12 flex-shrink-0">
                    {/* Initials fallback (always rendered behind the image) */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-navy text-white font-bold text-lg shadow-inner">
                        {trip.driver?.firstName?.[0]}
                        {trip.driver?.lastName?.[0]}
                    </div>
                    {/* Driver photo (on top, hides on error to reveal initials) */}
                    {getImageUrl(trip.driver?.driverProfile?.personalPhotoUrl) && (
                        <img
                            src={getImageUrl(trip.driver?.driverProfile?.personalPhotoUrl)}
                            alt="Driver"
                            className="absolute inset-0 h-12 w-12 rounded-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {trip.driver?.firstName} {trip.driver?.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 truncate">
                        <Car className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="truncate">
                            {trip.driver?.driverProfile?.carModel}
                            {trip.driver?.driverProfile?.carColor
                                ? ` • ${trip.driver.driverProfile.carColor}`
                                : ''}
                        </span>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/60 backdrop-blur-sm px-2 py-1 text-xs font-mono font-medium text-zinc-600 shadow-sm border border-zinc-200/50 dark:bg-zinc-800/60 dark:border-zinc-700/50 dark:text-zinc-400">
                        {trip.driver?.driverProfile?.plateNumber}
                    </span>
                </div>
            </div>

            {/* Route Section */}
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-0.5 pt-1">
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-emerald-500 bg-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <div className="h-8 w-0.5 bg-gradient-to-b from-emerald-500 to-navy opacity-60" />
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-navy bg-indigo-100 shadow-[0_0_8px_rgba(30,58,138,0.4)]" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {trip.fromCity}
                            </p>
                            {trip.fromAddress && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {trip.fromAddress}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {trip.toCity}
                            </p>
                            {trip.toAddress && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {trip.toAddress}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 p-2.5 shadow-sm dark:bg-zinc-800/50 dark:border-zinc-700/50">
                        <CalendarDays className="h-4 w-4 text-emerald-600" />
                        <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('common.date')}</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {formattedDateStr}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 p-2.5 shadow-sm dark:bg-zinc-800/50 dark:border-zinc-700/50">
                        <Clock className="h-4 w-4 text-navy" />
                        <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('common.time')}</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {formattedTimeStr}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 p-2.5 min-w-0 shadow-sm dark:bg-zinc-800/50 dark:border-zinc-700/50">
                        <Navigation className="h-4 w-4 shrink-0 text-emerald-500" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {t('trips.meetingPoint')}
                            </p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate" title={trip.gatheringLocation}>
                                {trip.gatheringLocation}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 p-2.5 min-w-0 shadow-sm dark:bg-zinc-800/50 dark:border-zinc-700/50">
                        <Users className="h-4 w-4 shrink-0 text-navy" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('common.seats')}</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                <span
                                    className={
                                        isFull ? 'text-red-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'
                                    }
                                >
                                    {trip.availableSeats}
                                </span>
                                /{trip.totalSeats}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer: Price + Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100/50 bg-zinc-50/30 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/30">
                <div className="flex items-baseline gap-1 shrink-0">
                    <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-navy to-emerald-600 dark:from-blue-400 dark:to-emerald-400 drop-shadow-sm">
                        {trip.pricePerSeat ? Math.round(Number(trip.pricePerSeat)) : Math.round(Number(trip.price) / trip.totalSeats)}
                    </span>
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {t('common.perSeat')}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => onViewDetails?.(trip.id)}
                        className="rounded-xl border border-zinc-200/80 bg-white/50 px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 shadow-sm hover:shadow dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-700/80"
                    >
                        {t('common.details')}
                    </button>
                    {!hideBooking && (
                        isBooked ? (
                            <span className="rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
                                ✓ {t('trips.alreadyBooked')}
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onBook?.(trip.id)}
                                disabled={isFull || isBooking}
                                className={`btn-3d btn-liquid rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all ${isFull
                                    ? 'bg-zinc-400 cursor-not-allowed dark:bg-zinc-600'
                                    : 'bg-gradient-to-r from-navy to-emerald shadow-lg hover:shadow-xl active:scale-95 hover:from-navy-light hover:to-emerald-500'
                                    }`}
                            >
                                {isFull ? t('trips.joinWaitlist') : isBooking ? t('trips.booking') : t('trips.bookSeat')}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
