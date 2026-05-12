'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TripList } from '@/components/trips';
import { BookingRulesModal } from '@/components/trips/BookingRulesModal';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTripStore } from '@/stores/useTripStore';
import { Trip } from '@/types';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TripsPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const { bookSeat, isBooking } = useBookingStore();
    const { trips, fetchTrips } = useTripStore();
    const isDriverOrAdmin = user?.role === 'DRIVER' || user?.role === 'ADMIN';

    // Modal state for booking flow
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [bookingError, setBookingError] = useState<string | null>(null);

    const handleBook = (tripId: string) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        // Find the trip from the current list to get pricing data
        const trip = trips.find((t) => t.id === tripId) || null;
        if (!trip) {
            router.push(`/trips/${tripId}`);
            return;
        }
        setSelectedTrip(trip);
        setBookingError(null);
        setShowBookingModal(true);
    };

    const handleConfirmBooking = async (paymentMethod: 'WALLET' | 'CASH') => {
        if (!selectedTrip) return;
        setBookingError(null);

        const success = await bookSeat(selectedTrip.id, 1, paymentMethod, {
            fromCity: selectedTrip.fromCity,
            toCity: selectedTrip.toCity,
            pricePerSeat,
        });
        if (success) {
            setShowBookingModal(false);
            setSelectedTrip(null);
            // Refresh the trip list to update seat counts
            fetchTrips();
            toast.success(
                paymentMethod === 'WALLET'
                    ? 'تم الحجز بنجاح! تم الخصم من المحفظة ✅'
                    : 'تم تأكيد الحجز! الدفع كاش عند الرحلة ✅'
            );
            router.push('/bookings');
        } else {
            const storeError = useBookingStore.getState().error;
            setBookingError(storeError || 'Booking failed. Please try again.');
            toast.error(storeError || 'Booking failed. Please try again.');
        }
    };

    const handleViewDetails = (tripId: string) => {
        router.push(`/trips/${tripId}`);
    };

    // Derive price per seat from the selected trip
    const pricePerSeat = selectedTrip
        ? selectedTrip.pricePerSeat
            ? Math.round(Number(selectedTrip.pricePerSeat))
            : Math.round(Number(selectedTrip.price) / selectedTrip.totalSeats)
        : 0;

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

            {/* Booking Rules Modal — enforces the Instructions → Payment → Confirm flow */}
            {selectedTrip && (
                <BookingRulesModal
                    isOpen={showBookingModal}
                    onClose={() => {
                        setShowBookingModal(false);
                        setSelectedTrip(null);
                    }}
                    onConfirm={handleConfirmBooking}
                    tripFromCity={selectedTrip.fromCity}
                    tripToCity={selectedTrip.toCity}
                    pricePerSeat={pricePerSeat}
                    seats={1}
                    isBooking={isBooking}
                />
            )}
        </div>
    );
}
