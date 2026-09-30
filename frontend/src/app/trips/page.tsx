'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TripList } from '@/components/trips';
import { BookingRulesModal } from '@/components/trips/BookingRulesModal';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTripStore } from '@/stores/useTripStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Trip } from '@/types';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TripsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, user } = useAuthStore();
    const { bookSeat, isBooking } = useBookingStore();
    const { trips, fetchTrips } = useTripStore();
    const { t } = useTranslation();
    const isDriverOrAdmin = user?.role === 'DRIVER' || user?.role === 'ADMIN';
    const initialFromCity = searchParams.get('fromCity') || '';
    const initialToCity = searchParams.get('toCity') || '';

    // Modal state for booking flow
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

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
        setShowBookingModal(true);
    };

    const handleConfirmBooking = async (paymentMethod: 'WALLET' | 'CASH') => {
        if (!selectedTrip) return;
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 glass-card mt-6 mb-6 text-zinc-800 dark:text-zinc-100">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/50 backdrop-blur-md shadow-sm border border-white/20 dark:bg-zinc-800/50 dark:border-zinc-700/50">
                        <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white drop-shadow-sm">
                            {t('trips.title')}
                        </h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            {isDriverOrAdmin ? t('trips.subtitle.driver') : t('trips.subtitle.passenger')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Trip List with Filters */}
            <TripList
                onBook={handleBook}
                onViewDetails={handleViewDetails}
                hideBooking={isDriverOrAdmin}
                initialFilters={initialFromCity || initialToCity ? { fromCity: initialFromCity, toCity: initialToCity } : undefined}
            />

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
