'use client';

import React from 'react';
import { Trip } from '@/types';
import { useBookingStore } from '@/stores/useBookingStore';
import {
    MapPin,
    Clock,
    Users,
    Star,
    Car,
    CreditCard,
    Navigation,
    CalendarDays,
} from 'lucide-react';

interface TripCardProps {
    trip: Trip;
    onBook?: (tripId: string) => void;
    onViewDetails?: (tripId: string) => void;
}

export function TripCard({ trip, onBook, onViewDetails }: TripCardProps) {
    const { isBooking } = useBookingStore();

    const departureDate = new Date(trip.departureTime);
    const formattedDate = departureDate.toLocaleDateString('en-EG', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    const formattedTime = departureDate.toLocaleTimeString('en-EG', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const isFull = trip.availableSeats <= 0;
    const isConfirmed = trip.status === 'DRIVER_CONFIRMED';

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800">
            {/* Status Badge */}
            {isConfirmed && (
                <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Driver Ready
                </div>
            )}

            {/* Driver Section */}
            <div className="flex items-center gap-3 border-b border-zinc-100 p-4 dark:border-zinc-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                    {trip.driver?.firstName?.[0]}
                    {trip.driver?.lastName?.[0]}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {trip.driver?.firstName} {trip.driver?.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <Car className="h-3.5 w-3.5" />
                        <span>
                            {trip.driver?.driverProfile?.carModel}
                            {trip.driver?.driverProfile?.carColor
                                ? ` • ${trip.driver.driverProfile.carColor}`
                                : ''}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-mono font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {trip.driver?.driverProfile?.plateNumber}
                    </span>
                </div>
            </div>

            {/* Route Section */}
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-0.5 pt-1">
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-blue-100" />
                        <div className="h-8 w-0.5 bg-gradient-to-b from-blue-500 to-emerald-500 opacity-40" />
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-emerald-500 bg-emerald-100" />
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
                    <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                        <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Date</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {formattedDate}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Time</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {formattedTime}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                        <Navigation className="h-4 w-4 text-pink-500" />
                        <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Meeting Point
                            </p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">
                                {trip.gatheringLocation}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                        <Users className="h-4 w-4 text-amber-500" />
                        <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Seats</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                <span
                                    className={
                                        isFull ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                                    }
                                >
                                    {trip.availableSeats}
                                </span>
                                /{trip.totalSeats} available
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer: Price + Actions */}
            <div className="flex items-center justify-between border-t border-zinc-100 p-4 dark:border-zinc-800">
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {Number(trip.price).toFixed(0)}
                    </span>
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        EGP
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewDetails?.(trip.id)}
                        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        Details
                    </button>
                    <button
                        onClick={() => onBook?.(trip.id)}
                        disabled={isFull || isBooking}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all ${isFull
                                ? 'bg-zinc-300 cursor-not-allowed dark:bg-zinc-700'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md active:scale-95'
                            }`}
                    >
                        {isFull ? 'Join Waitlist' : isBooking ? 'Booking...' : 'Book Seat'}
                    </button>
                </div>
            </div>

            {/* Waitlist indicator */}
            {trip._count?.waitlists && trip._count.waitlists > 0 && (
                <div className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                    {trip._count.waitlists} {trip._count.waitlists === 1 ? 'person' : 'people'}{' '}
                    on waitlist
                </div>
            )}
        </div>
    );
}
