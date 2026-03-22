'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TripList } from '@/components/trips';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { MapPin } from 'lucide-react';

export default function TripsPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const { bookSeat } = useBookingStore();
    const isDriverOrAdmin = user?.role === 'DRIVER' || user?.role === 'ADMIN';

    const handleBook = async (tripId: string) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        const success = await bookSeat(tripId, 1);
        if (success) {
            router.push('/bookings');
        }
    };

    const handleViewDetails = (tripId: string) => {
        router.push(`/trips/${tripId}`);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
                        <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                            Available Trips
                        </h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {isDriverOrAdmin ? 'Browse available trips' : 'Find and book inter-city rides'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Trip List with Filters */}
            <TripList onBook={handleBook} onViewDetails={handleViewDetails} hideBooking={isDriverOrAdmin} />
        </div>
    );
}
