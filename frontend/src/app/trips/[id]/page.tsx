'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTripStore } from '@/stores/useTripStore';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocket } from '@/providers/SocketProvider';
import { BookingRulesModal } from '@/components/trips/BookingRulesModal';
import { ReviewModal } from '@/components/ReviewModal';
import { api, getImageUrl } from '@/lib/api';
import { trackTripCompleted } from '@/lib/analytics';
import { Rating, Booking } from '@/types';
import { ClipboardList } from 'lucide-react';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';

const TripMap = dynamic(() => import('@/components/TripMap'), {
    ssr: false,
    loading: () => <div className="h-[250px] rounded-xl bg-zinc-100/50 backdrop-blur-sm animate-pulse dark:bg-zinc-800/50 glass-card" />,
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
    const { t } = useTranslation();

    const [seats, setSeats] = useState(1);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingResult, setBookingResult] = useState<{ bookingId: string; tripId: string; boardingToken: string } | null>(null);

    const [driverRatings, setDriverRatings] = useState<{ averageScore: number; totalRatings: number; recentReviews: Rating[] } | null>(null);

    const [showRating, setShowRating] = useState(false);
    const [ratingScore, setRatingScore] = useState(5);
    const [ratingReview, setRatingReview] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [tripActionLoading, setTripActionLoading] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);

    const isDriver = user?.id === trip?.driverId;
    const driverLocation = useDriverLocation({
        tripId,
        isDriver: !!isDriver,
        isInProgress: trip?.status === 'IN_PROGRESS',
    });

    useEffect(() => {
        if (tripId) {
            fetchTrip(tripId);
            api.getTripRatings(tripId).then((res) => setRatings((res.data as Rating[]) || [])).catch(() => { });
        }
    }, [tripId, fetchTrip]);

    useEffect(() => {
        if (trip?.driverId) {
            api.getDriverRatings(trip.driverId)
                .then((res) => setDriverRatings(res.data as { averageScore: number; totalRatings: number; recentReviews: Rating[] }))
                .catch(() => { });
        }
    }, [trip?.driverId]);

    const fetchBookings = useCallback(() => {
        if (trip && user) {
            api.getTripBookings(tripId).then((res) => setBookings((res.data as Booking[]) || [])).catch(() => { });
        }
    }, [trip?.id, user?.id, tripId]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    useEffect(() => {
        if (!socket || !tripId) return;
        const handleTripUpdate = (data: any) => {
            if (data.tripId === tripId) {
                updateTrip(data);
                fetchBookings();
            }
        };
        socket.on('tripUpdate', handleTripUpdate);
        return () => { socket.off('tripUpdate', handleTripUpdate); };
    }, [socket, tripId, updateTrip]);

    useEffect(() => {
        const isCompleted = trip?.status === 'COMPLETED';
        const isDriverUser = user?.id === trip?.driverId;
        const userAlreadyBooked = bookings.some((b) => b.userId === user?.id && b.status !== 'CANCELLED');
        const userHasRated = ratings.some((r) => r.raterId === user?.id);

        if (isCompleted && isAuthenticated && !isDriverUser && userAlreadyBooked && !userHasRated) {
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
        try {
            const res = await api.bookSeat(tripId, seats, paymentMethod);
            const rawBooking = res.data as any;
            setBookingSuccess(true);
            if (rawBooking?.boardingToken) {
                setBookingResult({
                    bookingId: rawBooking.id,
                    tripId: rawBooking.tripId,
                    boardingToken: rawBooking.boardingToken,
                });
            } else {
                setShowBookingModal(false);
            }
            fetchTrip(tripId);
            fetchBookings();
            toast.success(
                paymentMethod === 'WALLET'
                    ? t('tripDetails.bookingWalletSuccess') || 'تم الحجز بنجاح! تم الخصم من المحفظة ✅'
                    : t('tripDetails.bookingCashSuccess') || 'تم تأكيد الحجز! الدفع كاش عند الرحلة ✅'
            );
        } catch (err: any) {
            setBookingError(err.message || t('tripDetails.bookingFailed') || 'Booking failed. Please try again.');
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
            const res = await api.getTripRatings(tripId);
            setRatings((res.data as Rating[]) || []);
        } catch {
        } finally {
            setSubmittingRating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {error || t('tripDetails.notFound') || 'Trip not found'}
                </h2>
                <button onClick={() => router.back()} className="mt-4 text-emerald-600 hover:underline">
                    {t('tripDetails.goBack') || 'Go back'}
                </button>
            </div>
        );
    }

    const departure = new Date(trip.departureTime);
    const isFull = trip.availableSeats <= 0;
    const isCompleted = trip.status === 'COMPLETED';
    const userAlreadyBooked = bookings.some((b) => b.userId === user?.id && b.status !== 'CANCELLED');
    const userHasRated = ratings.some((r) => r.raterId === user?.id);

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 relative">
            {/* Background elements for glassmorphism */}
            <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-navy-500/10 blur-[80px]"></div>

            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover-lift"
            >
                <ArrowLeft className="h-4 w-4" />
                {t('tripDetails.backToTrips') || 'Back to trips'}
            </button>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Route Map */}
                    {((trip.gatheringLatitude && trip.gatheringLongitude) || (trip.destinationLatitude && trip.destinationLongitude)) && (
                        <div className="glass-card overflow-hidden shadow-lg p-1 hover-lift">
                            <div className="rounded-xl overflow-hidden relative border border-white/20 dark:border-white/10">
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
                                    driverLat={driverLocation?.lat}
                                    driverLng={driverLocation?.lng}
                                />
                            </div>
                        </div>
                    )}

                    {/* Route Card */}
                    <div className="glass-card p-6 shadow-xl hover-lift transition-all">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                {trip.fromCity} <span className="text-emerald-500">→</span> {trip.toCity}
                            </h1>
                            <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md border ${
                                trip.status === 'SCHEDULED' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                trip.status === 'DRIVER_CONFIRMED' ? 'bg-teal-100/50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800' :
                                trip.status === 'IN_PROGRESS' ? 'bg-navy-100/50 text-navy-700 border-navy-200 dark:bg-navy-900/30 dark:text-navy-400 dark:border-navy-800' :
                                trip.status === 'COMPLETED' ? 'bg-zinc-100/50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700' :
                                'bg-red-100/50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                            }`}>
                                {t(`tripStatus.${trip.status}` as any) || trip.status.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Route */}
                        <div className="flex items-start gap-3 mt-6">
                            <div className="flex flex-col items-center gap-0.5 pt-1">
                                <div className="h-4 w-4 rounded-full border-2 border-emerald-500 bg-emerald-100 dark:bg-emerald-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <div className="h-12 w-0.5 bg-gradient-to-b from-emerald-500 to-navy-500 opacity-60" />
                                <div className="h-4 w-4 rounded-full border-2 border-navy-500 bg-navy-100 dark:bg-navy-950 shadow-[0_0_8px_rgba(30,58,138,0.5)]" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100 text-lg">{trip.fromCity}</p>
                                    {trip.gatheringLocation && (
                                        <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                            <Navigation className="h-3.5 w-3.5 text-emerald-500" />
                                            {t('tripDetails.groupPoint') || 'Group Point'}: {trip.gatheringLocation}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100 text-lg">{trip.toCity}</p>
                                    {trip.toAddress && (
                                        <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                            <Flag className="h-3.5 w-3.5 text-navy-500" />
                                            {t('tripDetails.destinationPoint') || 'Destination Point'}: {trip.toAddress}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="flex items-center gap-3 rounded-xl bg-white/40 border border-white/20 p-3 backdrop-blur-sm dark:bg-zinc-800/40 dark:border-white/5 shadow-sm">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">{t('tripDetails.date') || 'Date'}</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {departure.toLocaleDateString('en-EG', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-white/40 border border-white/20 p-3 backdrop-blur-sm dark:bg-zinc-800/40 dark:border-white/5 shadow-sm">
                                <div className="p-2 bg-navy-100 dark:bg-navy-900/30 rounded-lg">
                                    <Clock className="h-4 w-4 text-navy-600 dark:text-navy-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">{t('tripDetails.time') || 'Time'}</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {departure.toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-white/40 border border-white/20 p-3 backdrop-blur-sm dark:bg-zinc-800/40 dark:border-white/5 shadow-sm">
                                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                                    <CreditCard className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">{t('tripDetails.price') || 'Price'}</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {Number(trip.price).toFixed(0)} EGP
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-white/40 border border-white/20 p-3 backdrop-blur-sm dark:bg-zinc-800/40 dark:border-white/5 shadow-sm">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">{t('tripDetails.seats') || 'Seats'}</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        <span className={isFull ? 'text-red-500' : 'text-emerald-600'}>{trip.availableSeats}</span>/{trip.totalSeats}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {trip.notes && (
                            <div className="mt-6 rounded-xl bg-emerald-50/50 backdrop-blur-sm border border-emerald-100 p-4 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-300">
                                <strong>{t('tripDetails.notes') || 'Notes'}:</strong> {trip.notes}
                            </div>
                        )}
                    </div>

                    {/* Driver Trip Controls */}
                    {isDriver && (trip.status === 'SCHEDULED' || trip.status === 'DRIVER_CONFIRMED' || trip.status === 'IN_PROGRESS') && (
                        <div className="glass-card p-6 shadow-xl">
                            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {t('tripDetails.tripControls') || 'Trip Controls'}
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {/* Register Passengers */}
                                {(trip.status === 'SCHEDULED' || trip.status === 'DRIVER_CONFIRMED') && (
                                    <button
                                        onClick={() => router.push(`/trips/${tripId}/board`)}
                                        className="btn-3d flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-emerald px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                                    >
                                        <ClipboardList className="h-4 w-4" />
                                        {t('tripDetails.boardPassengers') || 'تسجيل الركاب وبدء الرحلة'}
                                    </button>
                                )}

                                {/* Complete Trip */}
                                {trip.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={async () => {
                                            if (!confirm(t('tripDetails.confirmComplete') || 'Mark this trip as completed?')) return;
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
                                        className="btn-3d flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                                    >
                                        {tripActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        {t('tripDetails.completeTrip') || 'Complete Trip'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Passengers */}
                    {bookings.length > 0 && (
                        <div className="glass-card p-6 shadow-xl">
                            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {t('tripDetails.passengers') || 'Passengers'} ({bookings.length})
                            </h2>
                            <div className="space-y-3">
                                {bookings.map((b) => (
                                    <div key={b.id} className="flex flex-col gap-2 rounded-xl bg-white/40 border border-white/20 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-800/40 dark:border-white/5 transition-all hover:bg-white/60 dark:hover:bg-zinc-800/60">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-navy to-emerald text-sm font-bold text-white shadow-md">
                                                {(b as any).user?.firstName?.[0]}{(b as any).user?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    {(b as any).user?.firstName} {(b as any).user?.lastName}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 mt-1">
                                                    <p className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{b.seats} seat(s)</p>
                                                    {(b as any).user?.phone ? (
                                                        <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                            <Phone className="h-3 w-3" />
                                                            {(b as any).user.phone}
                                                        </p>
                                                    ) : (
                                                        <p className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-600">
                                                            <Phone className="h-3 w-3" />
                                                            Hidden
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 mt-2 sm:mt-0">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                                b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                b.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                            }`}>
                                                {t(`bookingStatus.${b.status}` as any) || b.status}
                                            </span>
                                            <span className={`text-xs font-semibold flex items-center gap-1 ${b.paymentMethod === 'WALLET' ? 'text-navy-600 dark:text-navy-400' : 'text-zinc-500'}`}>
                                                {b.paymentMethod === 'WALLET' ? '💳 Wallet' : '💵 Cash'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ratings Section */}
                    <div className="glass-card p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('tripDetails.ratings') || 'Trip Ratings'}</h2>
                            {isCompleted && isAuthenticated && !isDriver && (
                                <button
                                    onClick={() => setShowRating(!showRating)}
                                    className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 transition-colors"
                                >
                                    <Star className="h-3.5 w-3.5" />
                                    {t('tripDetails.rateDriver') || 'Rate Driver'}
                                </button>
                            )}
                        </div>

                        {showRating && (
                            <div className="mb-6 space-y-3 rounded-xl border border-white/20 bg-white/50 backdrop-blur-md p-4 dark:border-white/10 dark:bg-zinc-800/50 shadow-inner">
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button key={s} onClick={() => setRatingScore(s)} className="transition-transform hover:scale-110">
                                            <Star className={`h-7 w-7 ${s <= ratingScore ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-zinc-300 dark:text-zinc-600'}`} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={ratingReview}
                                    onChange={(e) => setRatingReview(e.target.value)}
                                    placeholder={t('tripDetails.reviewPlaceholder') || 'Write a review (optional)'}
                                    rows={3}
                                    className="w-full rounded-lg border border-white/20 bg-white/50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100"
                                />
                                <button
                                    onClick={handleSubmitRating}
                                    disabled={submittingRating}
                                    className="btn-3d rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {submittingRating ? (t('tripDetails.submitting') || 'Submitting...') : (t('tripDetails.submitRating') || 'Submit Rating')}
                                </button>
                            </div>
                        )}

                        {ratings.length === 0 ? (
                            <div className="py-8 text-center bg-zinc-50/50 dark:bg-zinc-800/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                                <Star className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-2" />
                                <p className="text-sm text-zinc-500">{t('tripDetails.noRatings') || 'No ratings for this trip yet'}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {ratings.map((r) => (
                                    <div key={r.id} className="rounded-xl bg-white/40 border border-white/20 p-4 backdrop-blur-sm dark:bg-zinc-800/40 dark:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} className={`h-4 w-4 ${s <= r.score ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`} />
                                                ))}
                                            </div>
                                            <span className="text-xs text-zinc-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {r.review && <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 bg-white/30 dark:bg-zinc-900/30 p-2 rounded-lg">{r.review}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Driver Info */}
                    <div className="glass-card p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -z-10"></div>
                        
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800 dark:text-navy-300">{t('tripDetails.driver') || 'Driver'}</h3>
                            
                            {/* Trust Badge */}
                            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full text-[10px] font-bold border border-emerald-100 dark:border-emerald-800/50">
                                <CheckCircle2 className="h-3 w-3" />
                                {t('tripDetails.verified') || 'VERIFIED'}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {(() => {
                                    const photoUrl = getImageUrl(trip.driver?.driverProfile?.personalPhotoUrl);
                                    return photoUrl ? (
                                        <img src={photoUrl} alt="Driver" className="h-16 w-16 rounded-full object-cover shadow-md border-2 border-white dark:border-zinc-700" />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-navy to-emerald text-xl font-bold text-white shadow-md border-2 border-white dark:border-zinc-700">
                                            {trip.driver?.firstName?.[0]}{trip.driver?.lastName?.[0]}
                                        </div>
                                    );
                                })()}
                                <div className="absolute bottom-0 right-0 h-4 w-4 bg-emerald-500 border-2 border-white dark:border-zinc-800 rounded-full"></div>
                            </div>
                            
                            <div>
                                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">
                                    {trip.driver?.firstName} {trip.driver?.lastName}
                                </p>
                                <div className="flex items-center gap-1.5 text-sm text-zinc-500 mt-1">
                                    <Car className="h-4 w-4 text-navy-500" />
                                    {trip.driver?.driverProfile?.carModel}
                                </div>
                                {trip.driver?.driverProfile?.plateNumber && (
                                    <span className="mt-2 inline-block rounded-md bg-zinc-100/80 px-2.5 py-1 text-xs font-mono font-bold text-navy-700 dark:bg-zinc-800/80 dark:text-navy-300 border border-zinc-200 dark:border-zinc-700">
                                        {trip.driver.driverProfile.plateNumber}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price & Booking */}
                    {!isDriver && user?.role !== 'ADMIN' && (
                        bookingSuccess || userAlreadyBooked ? (
                            <div className="glass-card border-2 border-emerald-400/50 bg-gradient-to-b from-emerald-50/80 to-white/80 p-6 shadow-xl dark:border-emerald-500/30 dark:from-emerald-900/20 dark:to-zinc-900/80 backdrop-blur-md relative overflow-hidden hover-lift">
                                <div className="absolute -top-10 -right-10 text-emerald-500/10 dark:text-emerald-400/5 w-40 h-40">
                                    <CheckCircle2 className="w-full h-full" />
                                </div>
                                <div className="text-center relative z-10">
                                    <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                                        {bookingSuccess ? (t('tripDetails.bookedSuccessfully') || 'Booked Successfully! 🎉') : (t('tripDetails.youAreBooked') || "You're Booked ✓")}
                                    </p>
                                    <p className="mt-2 text-sm text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                                        {t('tripDetails.seatConfirmed') || 'Your seat is confirmed for this trip'}
                                    </p>
                                    <button
                                        onClick={() => router.push('/bookings')}
                                        className="btn-3d mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700"
                                    >
                                        {t('tripDetails.viewMyBookings') || 'View My Bookings'}
                                    </button>
                                </div>
                            </div>
                        ) : trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' ? (
                            <div className="glass-card p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-navy-500/5 rounded-bl-full -z-10"></div>
                                
                                <div className="mb-6 text-center">
                                    <p className="text-sm font-medium text-navy-600/80 dark:text-navy-400/80 uppercase tracking-wider">{t('tripDetails.pricePerSeat') || 'Price per seat'}</p>
                                    <div className="flex items-baseline justify-center gap-1 mt-1">
                                        <p className="text-5xl font-extrabold text-navy-900 dark:text-white tracking-tight">
                                            {trip.pricePerSeat ? Math.round(Number(trip.pricePerSeat)) : Math.round(Number(trip.price) / trip.totalSeats)}
                                        </p>
                                        <span className="text-xl font-bold text-navy-500">EGP</span>
                                    </div>
                                    <p className="mt-2 text-xs font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 inline-block px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800">
                                        {t('tripDetails.totalTripPrice') || 'Total trip price'}: {Number(trip.price).toFixed(0)} EGP
                                    </p>
                                </div>
                                
                                <div className="mb-6 rounded-xl bg-white/50 p-4 backdrop-blur-sm border border-white/40 dark:bg-zinc-800/50 dark:border-white/5 shadow-inner">
                                    <div className="flex items-center justify-between text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                        <span>
                                            {trip.pricePerSeat ? Math.round(Number(trip.pricePerSeat)) : Math.round(Number(trip.price) / trip.totalSeats)} EGP × {seats} {t('tripDetails.seatSuffix') || 'seat(s)'}
                                        </span>
                                        <span>
                                            {Math.round((trip.pricePerSeat ? Number(trip.pricePerSeat) : Number(trip.price) / trip.totalSeats) * seats)} EGP
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-700/50 pt-3">
                                        <span className="text-sm font-bold text-navy-900 dark:text-navy-100">{t('tripDetails.total') || 'Total'}</span>
                                        <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                            {Math.round((trip.pricePerSeat ? Number(trip.pricePerSeat) : Number(trip.price) / trip.totalSeats) * seats)} EGP
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {!isFull && (
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('tripDetails.selectSeats') || 'Select Seats'}</label>
                                            <select
                                                value={seats}
                                                onChange={(e) => setSeats(Number(e.target.value))}
                                                className="w-full rounded-xl border border-white/20 bg-white/50 backdrop-blur-md px-4 py-3 text-sm font-medium shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 transition-all hover:bg-white/60 dark:hover:bg-zinc-800/60 outline-none"
                                            >
                                                {Array.from({ length: Math.min(trip.availableSeats, 4) }, (_, i) => i + 1).map((n) => {
                                                    const perSeat = trip.pricePerSeat ? Number(trip.pricePerSeat) : Math.round(Number(trip.price) / trip.totalSeats);
                                                    return (
                                                        <option key={n} value={n} className="bg-white dark:bg-zinc-800">{n} {t('tripDetails.seatSuffix') || 'seat(s)'} — {Math.round(perSeat * n)} EGP</option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    )}
                                    {bookingError && (
                                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span>{bookingError}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleBook}
                                        disabled={isBooking}
                                        className={`btn-3d btn-liquid w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg overflow-hidden relative ${
                                            isFull
                                                ? 'bg-navy/80 hover:bg-navy cursor-not-allowed opacity-90'
                                                : 'bg-gradient-to-r from-navy to-emerald hover:shadow-xl'
                                        } disabled:opacity-70`}
                                    >
                                        <span className="relative z-10 flex justify-center items-center gap-2">
                                            {isBooking ? (
                                                <><Loader2 className="h-4 w-4 animate-spin" /> {t('tripDetails.processing') || 'Processing...'}</>
                                            ) : isFull ? (
                                                <><Users className="h-4 w-4" /> {t('tripDetails.joinWaitlist') || 'Join Waitlist'}</>
                                            ) : (
                                                <>{`${t('trips.bookSeat')} (${seats})`}</>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ) : null
                    )}

                    {/* Waitlist info */}
                    {trip._count?.waitlists && trip._count.waitlists > 0 && (
                        <div className="glass-card border-none bg-indigo-50/80 p-4 text-center text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm">
                            <div className="flex items-center justify-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{trip._count.waitlists} {t('tripDetails.onWaitlist') || 'on waitlist'}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
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
                    isOpen={showBookingModal || (bookingResult !== null)}
                    onClose={() => { setShowBookingModal(false); setBookingResult(null); }}
                    onConfirm={handleConfirmBooking}
                    tripFromCity={trip.fromCity}
                    tripToCity={trip.toCity}
                    pricePerSeat={trip.pricePerSeat ? Number(trip.pricePerSeat) : Math.round(Number(trip.price) / trip.totalSeats)}
                    seats={seats}
                    isBooking={isBooking}
                    bookingResult={bookingResult}
                />
            )}
        </div>
    );
}
