'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { Trip } from '@/types';
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
} from 'lucide-react';

interface DashboardData {
    upcomingTrips: Trip[];
    completedTrips: Trip[];
    totalEarnings: number;
    totalTrips: number;
}

export default function DriverDashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [myTrips, setMyTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || (user?.role !== 'DRIVER' && user?.role !== 'ADMIN')) return;

        const load = async () => {
            setIsLoading(true);
            try {
                const [dashRes, tripsRes] = await Promise.all([
                    api.getDriverDashboard(),
                    api.getMyTrips(),
                ]);
                setData(dashRes.data as DashboardData);
                setMyTrips((tripsRes.data as Trip[]) || []);
            } catch {
                // fallback to just trips
                try {
                    const tripsRes = await api.getMyTrips();
                    setMyTrips((tripsRes.data as Trip[]) || []);
                } catch { }
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [isAuthenticated, user?.role]);

    if (!isAuthenticated || (user?.role !== 'DRIVER' && user?.role !== 'ADMIN')) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                <Gauge className="mb-4 h-12 w-12 text-zinc-300" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Drivers Only</h2>
                <p className="mt-1 text-sm text-zinc-500">You need a driver account to access this page.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const upcoming = myTrips.filter((t) => t.status === 'SCHEDULED' || t.status === 'DRIVER_CONFIRMED');
    const completed = myTrips.filter((t) => t.status === 'COMPLETED');

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                        <Gauge className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Driver Dashboard</h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Welcome back, {user?.firstName}!
                        </p>
                    </div>
                </div>
                <Link
                    href="/trips/create"
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-md"
                >
                    <Plus className="h-4 w-4" />
                    New Trip
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Route className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Total Trips</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {data?.totalTrips ?? myTrips.length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Completed</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {completed.length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                            <TrendingUp className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Earnings</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {data?.totalEarnings ?? '—'} <span className="text-sm font-normal text-zinc-500">EGP</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Trips */}
            <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Upcoming Trips ({upcoming.length})
                </h2>
                {upcoming.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
                        <Car className="mx-auto h-10 w-10 text-zinc-300" />
                        <p className="mt-3 text-sm text-zinc-500">No upcoming trips</p>
                        <Link href="/trips/create" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                            Create one now
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcoming.map((trip) => {
                            const departure = new Date(trip.departureTime);
                            return (
                                <div key={trip.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                                {trip.fromCity} → {trip.toCity}
                                            </h3>
                                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {departure.toLocaleDateString('en-EG', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {departure.toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {trip.gatheringLocation}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-sm">
                                                <span className="text-zinc-500">
                                                    {trip.totalSeats - trip.availableSeats}/{trip.totalSeats} booked
                                                </span>
                                                <span className="ml-3 font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {Number(trip.price)} EGP
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => router.push(`/trips/${trip.id}`)}
                                            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                        >
                                            Details
                                        </button>
                                    </div>

                                    {/* "I'm Ready" button */}
                                    <div className="mt-4">
                                        <DriverReadyButton
                                            tripId={trip.id}
                                            departureTime={trip.departureTime}
                                            isConfirmed={trip.status === 'DRIVER_CONFIRMED'}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Completed Trips */}
            {completed.length > 0 && (
                <div>
                    <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Completed Trips ({completed.length})
                    </h2>
                    <div className="space-y-3">
                        {completed.slice(0, 5).map((trip) => (
                            <div
                                key={trip.id}
                                onClick={() => router.push(`/trips/${trip.id}`)}
                                className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
                            >
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {trip.fromCity} → {trip.toCity}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {new Date(trip.departureTime).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {Number(trip.price)} EGP
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
