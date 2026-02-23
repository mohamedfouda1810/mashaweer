'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTripStore } from '@/stores/useTripStore';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { DriverReadyButton } from '@/components/driver/DriverReadyButton';
import { api } from '@/lib/api';
import { Rating, Booking } from '@/types';
import {
    MapPin,
    Clock,
    Users,
    Car,
    Navigation,
    CalendarDays,
    CreditCard,
    ArrowLeft,
    Loader2,
    Star,
    MessageSquare,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';

export default function TripDetailPage() {
    const params = useParams();
    const router = useRouter();
    const tripId = params.id as string;
    const { selectedTrip: trip, isLoading, error, fetchTrip } = useTripStore();
    const { bookSeat, isBooking } = useBookingStore();
    const { user, isAuthenticated } = useAuthStore();

    const [seats, setSeats] = useState(1);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    // Rating form
    const [showRating, setShowRating] = useState(false);
    const [ratingScore, setRatingScore] = useState(5);
    const [ratingReview, setRatingReview] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        if (tripId) {
            fetchTrip(tripId);
            api.getTripRatings(tripId).then((res) => setRatings((res.data as Rating[]) || [])).catch(() => { });
        }
    }, [tripId, fetchTrip]);

    // Load bookings for driver/admin
    useEffect(() => {
        if (trip && user && (user.id === trip.driverId || user.role === 'ADMIN')) {
            api.getTripBookings(tripId).then((res) => setBookings((res.data as Booking[]) || [])).catch(() => { });
        }
    }, [trip, user, tripId]);

    const handleBook = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        setBookingError(null);
        try {
            const success = await bookSeat(tripId, seats);
            if (success) {
                setBookingSuccess(true);
                // Refresh trip data to update available seats
                fetchTrip(tripId);
            }
        } catch (err: any) {
            setBookingError(err.message);
        }
    };

    const handleSubmitRating = async () => {
        if (!trip) return;
        setSubmittingRating(true);
        try {
            await api.submitRating({
                ratedId: trip.driverId,
                tripId: trip.id,
                score: ratingScore,
                review: ratingReview || undefined,
            });
            setShowRating(false);
            // Refresh ratings
            const res = await api.getTripRatings(tripId);
            setRatings((res.data as Rating[]) || []);
        } catch {
            // ignore
        } finally {
            setSubmittingRating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {error || 'Trip not found'}
                </h2>
                <button onClick={() => router.back()} className="mt-4 text-amber-600 hover:underline">
                    Go back
                </button>
            </div>
        );
    }

    const departure = new Date(trip.departureTime);
    const isFull = trip.availableSeats <= 0;
    const isDriver = user?.id === trip.driverId;
    const isCompleted = trip.status === 'COMPLETED';

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to trips
            </button>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Route Card */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                                {trip.fromCity} → {trip.toCity}
                            </h1>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${trip.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                trip.status === 'DRIVER_CONFIRMED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    trip.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        trip.status === 'COMPLETED' ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' :
                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {trip.status.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Route */}
                        <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-0.5 pt-1">
                                <div className="h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-100" />
                                <div className="h-12 w-0.5 bg-gradient-to-b from-amber-500 to-emerald-500 opacity-40" />
                                <div className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-emerald-100" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{trip.fromCity}</p>
                                    {trip.fromAddress && <p className="text-sm text-zinc-500">{trip.fromAddress}</p>}
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{trip.toCity}</p>
                                    {trip.toAddress && <p className="text-sm text-zinc-500">{trip.toAddress}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                <CalendarDays className="h-4 w-4 text-amber-500" />
                                <div>
                                    <p className="text-xs text-zinc-500">Date</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {departure.toLocaleDateString('en-EG', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                <Clock className="h-4 w-4 text-indigo-500" />
                                <div>
                                    <p className="text-xs text-zinc-500">Time</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {departure.toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                <Navigation className="h-4 w-4 text-pink-500" />
                                <div>
                                    <p className="text-xs text-zinc-500">Meeting Point</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                        {trip.gatheringLocation}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                <Users className="h-4 w-4 text-amber-500" />
                                <div>
                                    <p className="text-xs text-zinc-500">Seats</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        <span className={isFull ? 'text-red-500' : 'text-emerald-600'}>{trip.availableSeats}</span>/{trip.totalSeats}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {trip.notes && (
                            <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                                <strong>Notes:</strong> {trip.notes}
                            </div>
                        )}
                    </div>

                    {/* Driver "I'm Ready" for trip driver */}
                    {isDriver && (trip.status === 'SCHEDULED' || trip.status === 'DRIVER_CONFIRMED') && (
                        <DriverReadyButton
                            tripId={trip.id}
                            departureTime={trip.departureTime}
                            isConfirmed={trip.status === 'DRIVER_CONFIRMED'}
                        />
                    )}

                    {/* Passengers (Driver/Admin only) */}
                    {bookings.length > 0 && (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                Passengers ({bookings.length})
                            </h2>
                            <div className="space-y-3">
                                {bookings.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white">
                                                {(b as any).user?.firstName?.[0]}{(b as any).user?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    {(b as any).user?.firstName} {(b as any).user?.lastName}
                                                </p>
                                                <p className="text-xs text-zinc-500">{b.seats} seat(s)</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium ${b.status === 'CONFIRMED' ? 'text-emerald-600' :
                                            b.status === 'PENDING' ? 'text-amber-600' :
                                                'text-zinc-500'
                                            }`}>
                                            {b.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ratings Section */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                Ratings & Reviews
                            </h2>
                            {isCompleted && isAuthenticated && !isDriver && (
                                <button
                                    onClick={() => setShowRating(!showRating)}
                                    className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
                                >
                                    <Star className="h-3.5 w-3.5" />
                                    Rate Driver
                                </button>
                            )}
                        </div>

                        {/* Rating Form */}
                        {showRating && (
                            <div className="mb-4 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setRatingScore(s)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star className={`h-6 w-6 ${s <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={ratingReview}
                                    onChange={(e) => setRatingReview(e.target.value)}
                                    placeholder="Write a review (optional)"
                                    rows={3}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                                />
                                <button
                                    onClick={handleSubmitRating}
                                    disabled={submittingRating}
                                    className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                                >
                                    {submittingRating ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        )}

                        {ratings.length === 0 ? (
                            <p className="py-6 text-center text-sm text-zinc-500">No ratings yet</p>
                        ) : (
                            <div className="space-y-3">
                                {ratings.map((r) => (
                                    <div key={r.id} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} className={`h-3.5 w-3.5 ${s <= r.score ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                                                ))}
                                            </div>
                                            <span className="text-xs text-zinc-500">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {r.review && (
                                            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{r.review}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Driver Info */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Driver</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-bold text-white">
                                {trip.driver?.firstName?.[0]}{trip.driver?.lastName?.[0]}
                            </div>
                            <div>
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {trip.driver?.firstName} {trip.driver?.lastName}
                                </p>
                                <div className="flex items-center gap-1 text-sm text-zinc-500">
                                    <Car className="h-3.5 w-3.5" />
                                    {trip.driver?.driverProfile?.carModel}
                                </div>
                                {trip.driver?.driverProfile?.plateNumber && (
                                    <span className="mt-1 inline-block rounded bg-zinc-100 px-2 py-0.5 text-xs font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                        {trip.driver.driverProfile.plateNumber}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price & Booking */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-4 text-center">
                            <p className="text-sm text-zinc-500">Price per seat</p>
                            <p className="text-4xl font-bold text-zinc-900 dark:text-white">
                                {Number(trip.price).toFixed(0)}
                                <span className="ml-1 text-lg font-normal text-zinc-500">EGP</span>
                            </p>
                        </div>

                        {bookingSuccess ? (
                            <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
                                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                                <p className="mt-2 font-medium text-emerald-700 dark:text-emerald-400">Booked!</p>
                                <button
                                    onClick={() => router.push('/bookings')}
                                    className="mt-2 text-sm text-amber-600 hover:underline"
                                >
                                    View my bookings
                                </button>
                            </div>
                        ) : !isDriver && trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' ? (
                            <div className="space-y-3">
                                {!isFull && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Seats
                                        </label>
                                        <select
                                            value={seats}
                                            onChange={(e) => setSeats(Number(e.target.value))}
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                        >
                                            {Array.from({ length: Math.min(trip.availableSeats, 4) }, (_, i) => i + 1).map((n) => (
                                                <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''} — {Number(trip.price) * n} EGP</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {bookingError && (
                                    <p className="text-sm text-red-600">{bookingError}</p>
                                )}

                                <button
                                    onClick={handleBook}
                                    disabled={isBooking}
                                    className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] ${isFull
                                        ? 'bg-amber-500 hover:bg-amber-600'
                                        : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-indigo-700 shadow-sm hover:shadow-md'
                                        } disabled:opacity-50`}
                                >
                                    {isBooking ? 'Processing...' : isFull ? 'Join Waitlist' : `Book ${seats} Seat${seats > 1 ? 's' : ''}`}
                                </button>
                            </div>
                        ) : null}
                    </div>

                    {/* Waitlist info */}
                    {trip._count?.waitlists && trip._count.waitlists > 0 && (
                        <div className="rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                            <Users className="mx-auto mb-1 h-5 w-5" />
                            {trip._count.waitlists} on waitlist
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
