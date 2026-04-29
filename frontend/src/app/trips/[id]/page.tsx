'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTripStore } from '@/stores/useTripStore';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocket } from '@/providers/SocketProvider';
import { DriverReadyButton } from '@/components/driver/DriverReadyButton';
import { BookingRulesModal } from '@/components/trips/BookingRulesModal';
import { ReviewModal } from '@/components/ReviewModal';
import { api, getImageUrl } from '@/lib/api';
import { trackTripCompleted, trackDriverRated } from '@/lib/analytics';
import { Rating, Booking } from '@/types';
import toast from 'react-hot-toast';

const TripMap = dynamic(() => import('@/components/TripMap'), {
    ssr: false,
    loading: () => <div className="h-[250px] rounded-xl bg-zinc-100 animate-pulse dark:bg-zinc-800" />,
});
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
    Phone,
    Flag,
} from 'lucide-react';

export default function TripDetailPage() {
    const params = useParams();
    const router = useRouter();
    const tripId = params.id as string;
    const { selectedTrip: trip, isLoading, error, fetchTrip, updateTrip } = useTripStore();
    const { bookSeat, isBooking } = useBookingStore();
    const { user, isAuthenticated } = useAuthStore();
    const { socket } = useSocket();

    const [seats, setSeats] = useState(1);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    // Driver ratings (all-time from all trips)
    const [driverRatings, setDriverRatings] = useState<{ averageScore: number; totalRatings: number; recentReviews: any[] } | null>(null);

    // Rating form
    const [showRating, setShowRating] = useState(false);
    const [ratingScore, setRatingScore] = useState(5);
    const [ratingReview, setRatingReview] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [tripActionLoading, setTripActionLoading] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        if (tripId) {
            fetchTrip(tripId);
            api.getTripRatings(tripId).then((res) => setRatings((res.data as Rating[]) || [])).catch(() => { });
        }
    }, [tripId, fetchTrip]);

    // Fetch all-time driver ratings when trip loads
    useEffect(() => {
        if (trip?.driverId) {
            api.getDriverRatings(trip.driverId)
                .then((res) => setDriverRatings(res.data as any))
                .catch(() => { });
        }
    }, [trip?.driverId]);

    // Load bookings for all authenticated users
    const fetchBookings = () => {
        if (trip && user) {
            api.getTripBookings(tripId).then((res) => setBookings((res.data as Booking[]) || [])).catch(() => { });
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [trip?.id, user, tripId]); // using trip?.id instead of trip to avoid infinite loops

    useEffect(() => {
        if (!socket || !tripId) return;

        const handleTripUpdate = (data: any) => {
            if (data.tripId === tripId) {
                updateTrip(data);
                // Refresh bookings if needed
                fetchBookings();
            }
        };

        socket.on('tripUpdate', handleTripUpdate);

        return () => {
            socket.off('tripUpdate', handleTripUpdate);
        };
    }, [socket, tripId, updateTrip]);

    // Auto-show ReviewModal for passengers on completed trips
    // Must be before early returns to maintain consistent hook order
    useEffect(() => {
        const isCompleted = trip?.status === 'COMPLETED';
        const isDriver = user?.id === trip?.driverId;
        const userAlreadyBooked = bookings.some(
            (b) => b.userId === user?.id && b.status !== 'CANCELLED'
        );
        const userHasRated = ratings.some((r) => r.raterId === user?.id);

        if (
            isCompleted &&
            isAuthenticated &&
            !isDriver &&
            userAlreadyBooked &&
            !userHasRated
        ) {
            const timer = setTimeout(() => setShowReviewModal(true), 800);
            return () => clearTimeout(timer);
        }
    }, [trip?.status, trip?.driverId, isAuthenticated, user?.id, bookings, ratings]);

    const handleBook = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        setShowBookingModal(true);
    };

    const handleConfirmBooking = async (paymentMethod: 'WALLET' | 'CASH') => {
        setBookingError(null);
        const success = await bookSeat(tripId, seats, paymentMethod);
        if (success) {
            setBookingSuccess(true);
            setShowBookingModal(false);
            fetchTrip(tripId);
            fetchBookings();
            toast.success(
                paymentMethod === 'WALLET'
                    ? 'تم الحجز بنجاح! تم الخصم من المحفظة ✅'
                    : 'تم تأكيد الحجز! الدفع كاش عند الرحلة ✅'
            );
        } else {
            const storeError = useBookingStore.getState().error;
            setBookingError(storeError || 'Booking failed. Please try again.');
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
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
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
                <button onClick={() => router.back()} className="mt-4 text-teal-600 hover:underline">
                    Go back
                </button>
            </div>
        );
    }

    const departure = new Date(trip.departureTime);
    const isFull = trip.availableSeats <= 0;
    const isDriver = user?.id === trip.driverId;
    const isCompleted = trip.status === 'COMPLETED';
    const userAlreadyBooked = bookings.some(
        (b) => b.userId === user?.id && b.status !== 'CANCELLED'
    );
    const userHasRated = ratings.some((r) => r.raterId === user?.id);

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
                    {/* Route Map */}
                    {((trip.gatheringLatitude && trip.gatheringLongitude) || (trip.destinationLatitude && trip.destinationLongitude)) && (
                        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <TripMap
                                gatheringLat={trip.gatheringLatitude}
                                gatheringLng={trip.gatheringLongitude}
                                destinationLat={trip.destinationLatitude}
                                destinationLng={trip.destinationLongitude}
                                distanceKm={trip.distanceKm}
                                height="250px"
                                compact={false}
                                fromLabel={trip.gatheringLocation || trip.fromCity}
                                toLabel={trip.toAddress || trip.toCity}
                            />
                        </div>
                    )}

                    {/* Route Card */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                                {trip.fromCity} → {trip.toCity}
                            </h1>
                            <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${trip.status === 'SCHEDULED' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                                trip.status === 'DRIVER_CONFIRMED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    trip.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                        trip.status === 'COMPLETED' ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' :
                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {trip.status.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Route */}
                        <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-0.5 pt-1">
                                <div className="h-3 w-3 rounded-full border-2 border-teal-500 bg-teal-100" />
                                <div className="h-12 w-0.5 bg-gradient-to-b from-teal-500 to-indigo-500 opacity-40" />
                                <div className="h-3 w-3 rounded-full border-2 border-indigo-500 bg-indigo-100" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{trip.fromCity}</p>
                                    {trip.gatheringLocation && <p className="text-sm text-zinc-500"><Navigation className="mr-1 inline h-3 w-3" />Group Point: {trip.gatheringLocation}</p>}
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{trip.toCity}</p>
                                    {trip.toAddress && <p className="text-sm text-zinc-500"><Flag className="mr-1 inline h-3 w-3" />Destination Point: {trip.toAddress}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                <CalendarDays className="h-4 w-4 text-teal-500" />
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
                                <CreditCard className="h-4 w-4 text-cyan-500" />
                                <div>
                                    <p className="text-xs text-zinc-500">Price</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {Number(trip.price).toFixed(0)} EGP
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                <Users className="h-4 w-4 text-teal-500" />
                                <div>
                                    <p className="text-xs text-zinc-500">Seats</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        <span className={isFull ? 'text-red-500' : 'text-emerald-600'}>{trip.availableSeats}</span>/{trip.totalSeats}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {trip.notes && (
                            <div className="mt-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-900/20 dark:text-teal-300">
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

                    {/* Driver Trip Lifecycle Controls */}
                    {isDriver && (trip.status === 'DRIVER_CONFIRMED' || trip.status === 'IN_PROGRESS') && (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                Trip Controls
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {trip.status === 'DRIVER_CONFIRMED' && (
                                    <button
                                        onClick={async () => {
                                            setTripActionLoading(true);
                                            try {
                                                await api.startTrip(trip.id);
                                                toast.success('Trip started! 🚀');
                                                fetchTrip(tripId);
                                            } catch (err: any) {
                                                toast.error(err.message || 'Failed to start trip');
                                            } finally {
                                                setTripActionLoading(false);
                                            }
                                        }}
                                        disabled={tripActionLoading}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-700 hover:to-teal-700 hover:shadow-md disabled:opacity-50"
                                    >
                                        {tripActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                                        Start Trip
                                    </button>
                                )}
                                {trip.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={async () => {
                                            if (!confirm('Mark this trip as completed?')) return;
                                            setTripActionLoading(true);
                                            try {
                                                await api.completeTrip(trip.id);
                                                toast.success('Trip completed! ✅');
                                                trackTripCompleted(trip.id, trip.fromCity, trip.toCity);
                                                fetchTrip(tripId);
                                            } catch (err: any) {
                                                toast.error(err.message || 'Failed to complete trip');
                                            } finally {
                                                setTripActionLoading(false);
                                            }
                                        }}
                                        disabled={tripActionLoading}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-md disabled:opacity-50"
                                    >
                                        {tripActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        Complete Trip
                                    </button>
                                )}
                            </div>
                            <p className="mt-3 text-xs text-zinc-500">
                                {trip.status === 'DRIVER_CONFIRMED' && 'Start the trip when you begin driving. Passengers will be notified.'}
                                {trip.status === 'IN_PROGRESS' && 'Mark as complete when you arrive at the destination. All bookings will be finalized.'}
                            </p>
                        </div>
                    )}

                    {/* Passengers (Driver/Admin only) */}
                    {bookings.length > 0 && (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                Passengers ({bookings.length})
                            </h2>
                            <div className="space-y-3">
                                {bookings.map((b) => (
                                    <div key={b.id} className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 text-xs font-bold text-white">
                                                {(b as any).user?.firstName?.[0]}{(b as any).user?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    {(b as any).user?.firstName} {(b as any).user?.lastName}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-xs text-zinc-500">{b.seats} seat(s)</p>
                                                    {(b as any).user?.phone && (
                                                        <p className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400">
                                                            <Phone className="h-3 w-3" />
                                                            {(b as any).user.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-xs font-medium ${b.status === 'CONFIRMED' ? 'text-emerald-600' :
                                                b.status === 'PENDING' ? 'text-amber-600' :
                                                    'text-zinc-500'
                                                }`}>
                                                {b.status}
                                            </span>
                                                <span className={`text-xs font-semibold ${b.paymentMethod === 'WALLET' ? 'text-teal-500' : 'text-zinc-400'}`}>
                                                    {b.paymentMethod === 'WALLET' ? '💳 Wallet' : '💵 Cash'}
                                                </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ratings Section — This Trip */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                Trip Ratings
                            </h2>
                            {isCompleted && isAuthenticated && !isDriver && (
                                <button
                                    onClick={() => setShowRating(!showRating)}
                                    className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400"
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
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                                />
                                <button
                                    onClick={handleSubmitRating}
                                    disabled={submittingRating}
                                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                                >
                                    {submittingRating ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        )}

                        {ratings.length === 0 ? (
                            <p className="py-6 text-center text-sm text-zinc-500">No ratings for this trip yet</p>
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

                    {/* All-Time Driver Reviews */}
                    {driverRatings && driverRatings.totalRatings > 0 && (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="mb-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                        Driver Reviews
                                    </h2>
                                    <div className="flex items-center gap-1.5">
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                            {driverRatings.averageScore?.toFixed(1)}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            ({driverRatings.totalRatings} review{driverRatings.totalRatings !== 1 ? 's' : ''})
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-zinc-500">All reviews from previous passengers</p>
                            </div>

                            <div className="space-y-3">
                                {(driverRatings.recentReviews || []).map((r: any, i: number) => (
                                    <div key={r.id || i} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 text-[10px] font-bold text-white">
                                                    {r.rater?.firstName?.[0] || '?'}
                                                </div>
                                                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                    {r.rater?.firstName || 'Anonymous'}
                                                </span>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} className={`h-3 w-3 ${s <= r.score ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-zinc-400">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {r.review && (
                                            <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{r.review}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Driver Info */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Driver</h3>
                        <div className="flex items-center gap-3">
                            {(() => {
                                const photoUrl = getImageUrl(trip.driver?.driverProfile?.personalPhotoUrl);
                                return photoUrl ? (
                                    <img src={photoUrl} alt="Driver" className="h-14 w-14 rounded-full object-cover" />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 text-lg font-bold text-white">
                                        {trip.driver?.firstName?.[0]}{trip.driver?.lastName?.[0]}
                                    </div>
                                );
                            })()}
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
                                {trip.driver?.phone && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400">
                                        <Phone className="h-3 w-3" />
                                        {trip.driver.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price & Booking (hide for drivers/admins) */}
                    {!isDriver && user?.role !== 'ADMIN' && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-4 text-center">
                            <p className="text-sm text-zinc-500">Price per seat</p>
                            <p className="text-4xl font-bold text-zinc-900 dark:text-white">
                                {Math.round(Number(trip.price) / trip.totalSeats)}
                                <span className="ml-1 text-lg font-normal text-zinc-500">EGP</span>
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">Total trip price: {Number(trip.price).toFixed(0)} EGP</p>
                        </div>
                        {/* Total Price Breakdown */}
                        <div className="mb-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500">{Math.round(Number(trip.price) / trip.totalSeats)} EGP × {seats} seat{seats > 1 ? 's' : ''}</span>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {Math.round(Number(trip.price) / trip.totalSeats * seats)} EGP
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-2 dark:border-zinc-700">
                                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Total</span>
                                <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                                    {Math.round(Number(trip.price) / trip.totalSeats * seats)} EGP
                                </span>
                            </div>
                        </div>

                        {bookingSuccess || userAlreadyBooked ? (
                            <div className="rounded-lg bg-mint/10 p-4 text-center dark:bg-mint/20">
                                <CheckCircle2 className="mx-auto h-8 w-8 text-mint" />
                                <p className="mt-2 font-medium text-mint-dark dark:text-mint-light">
                                    {bookingSuccess ? 'Booked!' : '✓ Already Booked'}
                                </p>
                                <button
                                    onClick={() => router.push('/bookings')}
                                    className="mt-2 text-sm text-navy hover:underline dark:text-mint"
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
                                            {Array.from({ length: Math.min(trip.availableSeats, 4) }, (_, i) => i + 1).map((n) => {
                                                const perSeat = trip.pricePerSeat ? Number(trip.pricePerSeat) : Math.round(Number(trip.price) / trip.totalSeats);
                                                return (
                                                    <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''} — {Math.round(perSeat * n)} EGP</option>
                                                );
                                            })}
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
                                        ? 'bg-navy-light hover:bg-navy'
                                        : 'bg-gradient-to-r from-navy to-mint hover:from-navy-light hover:to-mint-light shadow-sm hover:shadow-md'
                                        } disabled:opacity-50`}
                                >
                                    {isBooking ? 'Processing...' : isFull ? 'Join Waitlist' : `Book ${seats} Seat${seats > 1 ? 's' : ''}`}
                                </button>
                            </div>
                        ) : null}
                    </div>
                    )}

                    {/* Waitlist info */}
                    {trip._count?.waitlists && trip._count.waitlists > 0 && (
                        <div className="rounded-xl bg-indigo-50 p-4 text-center text-sm text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
                            <Users className="mx-auto mb-1 h-5 w-5" />
                            {trip._count.waitlists} on waitlist
                        </div>
                    )}
                </div>
            </div>

            {/* Auto-triggered Review Modal for passengers */}
            {trip && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    tripId={trip.id}
                    driverId={trip.driverId}
                    driverName={`${trip.driver?.firstName || ''} ${trip.driver?.lastName || ''}`}
                    onSuccess={() => {
                        api.getTripRatings(tripId)
                            .then((res) => setRatings((res.data as Rating[]) || []))
                            .catch(() => {});
                    }}
                />
            )}

            {/* Booking Rules Modal */}
            {trip && (
                <BookingRulesModal
                    isOpen={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    onConfirm={handleConfirmBooking}
                    tripFromCity={trip.fromCity}
                    tripToCity={trip.toCity}
                    pricePerSeat={trip.pricePerSeat ? Number(trip.pricePerSeat) : Math.round(Number(trip.price) / trip.totalSeats)}
                    seats={seats}
                    isBooking={isBooking}
                />
            )}
        </div>
    );
}
