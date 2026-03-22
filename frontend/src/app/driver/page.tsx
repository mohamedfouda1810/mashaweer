'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { Trip } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DriverReadyButton } from '@/components/driver/DriverReadyButton';
import toast from 'react-hot-toast';
import {
    Gauge,
    Plus,
    Car,
    MapPin,
    Calendar,
    Clock,
    Loader2,
    TrendingUp,
    CheckCircle2,
    Route,
    Users,
    Banknote,
    ArrowRight,
    Edit3,
    Trash2,
    X
} from 'lucide-react';

interface DashboardData {
    upcomingTrips: Trip[];
    pastTrips: Trip[];
    allTrips: Trip[];
    totalTrips: number;
    totalEarnings: number;
    rating: { average: number; totalReviews: number };
    walletBalance: number;
}

export default function DriverDashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [myTrips, setMyTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Edit modal state
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const load = async () => {
        setIsLoading(true);
        try {
            const dashRes = await api.getDriverDashboard();
            const dashData = dashRes.data as DashboardData;
            setData(dashData);
            setMyTrips(dashData?.allTrips || dashData?.upcomingTrips || []);
        } catch {
            // Error handling
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || (user?.role !== 'DRIVER' && user?.role !== 'ADMIN')) return;
        load();
    }, [isAuthenticated, user?.role]);

    const canEditTrip = (trip: Trip) => {
        if (trip.status !== 'SCHEDULED') return false;
        const hoursSinceCreation = (Date.now() - new Date(trip.createdAt).getTime()) / (1000 * 60 * 60);
        return hoursSinceCreation <= 1;
    };

    const isWithinOneHour = (trip: Trip) => {
        const hoursSinceCreation = (Date.now() - new Date(trip.createdAt).getTime()) / (1000 * 60 * 60);
        return hoursSinceCreation <= 1;
    };

    const canCancelTrip = (trip: Trip) => {
        return trip.status === 'SCHEDULED' || trip.status === 'DRIVER_CONFIRMED';
    };

    const handleCancelTrip = async (tripId: string) => {
        if (!confirm('Are you sure you want to cancel this trip? All booked passengers will be notified.')) return;
        setActionLoading(tripId);
        try {
            await api.cancelTrip(tripId);
            toast.success('Trip cancelled. Passengers have been notified.');
            load();
        } catch (err: any) {
            toast.error(err.message || 'Failed to cancel trip');
        } finally {
            setActionLoading(null);
        }
    };

    // Cancellation request (after 1 hour)
    const [cancelRequestTrip, setCancelRequestTrip] = useState<Trip | null>(null);
    const [cancelRequestReason, setCancelRequestReason] = useState('');

    const handleRequestCancellation = async () => {
        if (!cancelRequestTrip || !cancelRequestReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }
        setActionLoading(cancelRequestTrip.id);
        try {
            await api.requestTripCancellation(cancelRequestTrip.id, cancelRequestReason);
            toast.success('Cancellation request submitted! Admin will review it.');
            setCancelRequestTrip(null);
            setCancelRequestReason('');
            load();
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit cancellation request');
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (trip: Trip) => {
        setEditingTrip(trip);
        setEditForm({
            fromCity: trip.fromCity,
            toCity: trip.toCity,
            gatheringLocation: trip.gatheringLocation || '',
            departureTime: new Date(trip.departureTime).toISOString().slice(0, 16),
            price: trip.price,
            totalSeats: trip.totalSeats,
            notes: (trip as any).notes || '',
        });
    };

    const handleEditSubmit = async () => {
        if (!editingTrip) return;
        setActionLoading(editingTrip.id);
        try {
            await api.editTrip(editingTrip.id, {
                ...editForm,
                price: Number(editForm.price),
                totalSeats: Number(editForm.totalSeats),
            });
            toast.success('Trip updated successfully!');
            setEditingTrip(null);
            load();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update trip');
        } finally {
            setActionLoading(null);
        }
    };

    const upcoming = myTrips.filter((t) => t.status === 'SCHEDULED' || t.status === 'DRIVER_CONFIRMED');
    const completed = myTrips.filter((t) => t.status === 'COMPLETED');

    return (
        <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN']}>
            <div className="min-h-[calc(100vh-3.5rem)] px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                                <Gauge className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                                    Driver Dashboard
                                </h1>
                                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                    Manage your trips and earnings
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/trips/create"
                            className="inline-flex items-center rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-teal-600 hover:to-indigo-700 hover:shadow-md active:scale-[0.98]"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Trip
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
                                            <Route className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Trips</p>
                                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{data?.totalTrips ?? 0}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Earnings</p>
                                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                EGP {data?.totalEarnings ?? 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                                            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Upcoming</p>
                                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{upcoming.length}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                                            <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Completed</p>
                                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{completed.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trip List */}
                            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
                                <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-white">My Trips</h2>

                                {myTrips.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {myTrips.map(trip => {
                                            const pricePerSeat = Number(trip.price) / trip.totalSeats;
                                            const bookedSeats = trip.totalSeats - trip.availableSeats;
                                            const tripEarnings = Math.round(pricePerSeat * bookedSeats * 100) / 100;
                                            return (
                                            <div key={trip.id} className="relative block rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-all hover:bg-zinc-100 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:bg-zinc-900">
                                                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                                                {trip.fromCity}
                                                            </span>
                                                            <ArrowRight className="h-4 w-4 text-zinc-400" />
                                                            <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                                                {trip.toCity}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-zinc-600 dark:text-zinc-400">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {new Date(trip.departureTime).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-4 w-4" />
                                                                {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                {trip.gatheringLocation}
                                                            </div>
                                                        </div>
                                                        {canEditTrip(trip) && (
                                                            <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
                                                                ✏️ You can edit this trip (within 1 hour of creation)
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${trip.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            trip.status === 'DRIVER_CONFIRMED' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' :
                                                                trip.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                                                            }`}>
                                                            {trip.status.replace('_', ' ')}
                                                        </span>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                                                EGP {Math.round(pricePerSeat)}
                                                                <span className="text-sm font-normal text-zinc-500"> / seat</span>
                                                            </p>
                                                            {trip.status === 'COMPLETED' && bookedSeats > 0 && (
                                                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                                                    Earned: {tripEarnings} EGP
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                        <Users className="h-4 w-4" />
                                                        <span>
                                                            <strong className="text-zinc-900 dark:text-white">{bookedSeats}</strong>
                                                            /{trip.totalSeats} seats booked
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <Link
                                                            href={`/trips/${trip.id}`}
                                                            className="flex flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 sm:flex-none"
                                                        >
                                                            View Details
                                                        </Link>
                                                        {canEditTrip(trip) && (
                                                            <button
                                                                onClick={() => openEditModal(trip)}
                                                                className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30"
                                                            >
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                                Edit
                                                            </button>
                                                        )}
                                                        {canCancelTrip(trip) && isWithinOneHour(trip) && (
                                                            <button
                                                                onClick={() => handleCancelTrip(trip.id)}
                                                                disabled={actionLoading === trip.id}
                                                                className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                {actionLoading === trip.id ? 'Cancelling...' : 'Cancel'}
                                                            </button>
                                                        )}
                                                        {canCancelTrip(trip) && !isWithinOneHour(trip) && (
                                                            <button
                                                                onClick={() => setCancelRequestTrip(trip)}
                                                                disabled={actionLoading === trip.id}
                                                                className="flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Request Cancel
                                                            </button>
                                                        )}
                                                        {(trip.status === 'SCHEDULED' || trip.status === 'DRIVER_CONFIRMED') && (
                                                            <DriverReadyButton
                                                                tripId={trip.id}
                                                                isConfirmed={trip.status === 'DRIVER_CONFIRMED'}
                                                                onConfirm={load}
                                                                departureTime={trip.departureTime}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
                                        <Car className="mx-auto h-12 w-12 text-zinc-400" />
                                        <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">No trips yet</h3>
                                        <p className="mt-1 text-sm text-zinc-500">Get started by creating your first trip.</p>
                                        <div className="mt-6">
                                            <Link
                                                href="/trips/create"
                                                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Trip
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Edit Trip Modal */}
            {editingTrip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Edit Trip</h2>
                            <button onClick={() => setEditingTrip(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">From City</label>
                                    <input value={editForm.fromCity || ''} onChange={(e) => setEditForm({ ...editForm, fromCity: e.target.value })} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">To City</label>
                                    <input value={editForm.toCity || ''} onChange={(e) => setEditForm({ ...editForm, toCity: e.target.value })} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Gathering Location</label>
                                <input value={editForm.gatheringLocation || ''} onChange={(e) => setEditForm({ ...editForm, gatheringLocation: e.target.value })} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Departure Time</label>
                                <input type="datetime-local" value={editForm.departureTime || ''} onChange={(e) => setEditForm({ ...editForm, departureTime: e.target.value })} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Price (EGP)</label>
                                    <input type="number" value={editForm.price || ''} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Seats</label>
                                    <input type="number" value={editForm.totalSeats || ''} onChange={(e) => setEditForm({ ...editForm, totalSeats: e.target.value })} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
                                <textarea value={editForm.notes || ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={2} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setEditingTrip(null)} className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
                                    Cancel
                                </button>
                                <button onClick={handleEditSubmit} disabled={actionLoading === editingTrip.id} className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50">
                                    {actionLoading === editingTrip.id ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CANCELLATION REQUEST MODAL */}
            {cancelRequestTrip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCancelRequestTrip(null)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-1 text-lg font-bold text-zinc-900 dark:text-white">
                            🚨 Request Trip Cancellation
                        </h3>
                        <p className="mb-4 text-sm text-zinc-500">
                            {cancelRequestTrip.fromCity} → {cancelRequestTrip.toCity} — {new Date(cancelRequestTrip.departureTime).toLocaleDateString()}
                        </p>
                        <p className="mb-3 text-xs text-orange-600 dark:text-orange-400">
                            Since this trip was created more than 1 hour ago, your cancellation request will be sent to admin for review.
                        </p>
                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Reason for Cancellation *</label>
                        <textarea
                            value={cancelRequestReason}
                            onChange={(e) => setCancelRequestReason(e.target.value)}
                            rows={3}
                            placeholder="Please explain why you need to cancel this trip..."
                            className="mb-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setCancelRequestTrip(null); setCancelRequestReason(''); }}
                                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestCancellation}
                                disabled={!cancelRequestReason.trim() || actionLoading === cancelRequestTrip.id}
                                className="flex-1 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50"
                            >
                                {actionLoading === cancelRequestTrip.id ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
