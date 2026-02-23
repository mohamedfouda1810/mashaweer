'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { Trip } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DriverReadyButton } from '@/components/driver/DriverReadyButton';
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
    ArrowRight
} from 'lucide-react';

interface DashboardData {
    upcomingTrips: Trip[];
    completedTrips: Trip[];
    totalEarnings: number;
    totalTrips: number;
    trips: Trip[];
}

export default function DriverDashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [myTrips, setMyTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = async () => {
        setIsLoading(true);
        try {
            const dashRes = await api.getDriverDashboard();
            const dashData = dashRes.data as DashboardData;
            setData(dashData);
            setMyTrips(dashData.trips || dashData.upcomingTrips || []);
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

    const upcoming = myTrips.filter((t) => t.status === 'SCHEDULED' || t.status === 'DRIVER_CONFIRMED');
    const completed = myTrips.filter((t) => t.status === 'COMPLETED');

    return (
        <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN']}>
            <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
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
                                    Manage your upcoming trips and earnings.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/trips/create"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 sm:w-auto"
                        >
                            <Plus className="h-5 w-5" />
                            Create Trip
                        </Link>
                    </div>

                    {/* Stats */}
                    {isLoading ? (
                        <div className="flex justify-center py-12 text-amber-600">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                                            <Route className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Trips</p>
                                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{data?.totalTrips ?? myTrips.length}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                            <Banknote className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Earnings</p>
                                            <p className="text-2xl font-bold text-zinc-900 dark:text-white text-emerald-600">
                                                EGP {data?.totalEarnings ?? completed.reduce((acc, t) => acc + (t.price * (t.totalSeats - t.availableSeats)), 0)}
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
                                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                                {upcoming.length}
                                            </p>
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
                                        {myTrips.map(trip => (
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
                                                    </div>
                                                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${trip.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            trip.status === 'DRIVER_CONFIRMED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                trip.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                                                            }`}>
                                                            {trip.status.replace('_', ' ')}
                                                        </span>
                                                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                                            EGP {trip.price}
                                                            <span className="text-sm font-normal text-zinc-500"> / seat</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                        <Users className="h-4 w-4" />
                                                        <span>
                                                            <strong className="text-zinc-900 dark:text-white">
                                                                {trip.totalSeats - trip.availableSeats}
                                                            </strong>
                                                            /{trip.totalSeats} seats booked
                                                        </span>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={`/trips/${trip.id}`}
                                                            className="flex flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 sm:flex-none"
                                                        >
                                                            View Details
                                                        </Link>
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
                                        ))}
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
        </ProtectedRoute>
    );
}
