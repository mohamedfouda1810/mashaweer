'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import {
    MapPin,
    Clock,
    Users,
    CreditCard,
    Navigation,
    CalendarDays,
    Plus,
    Loader2,
    StickyNote,
    Flag,
    Map,
    TrendingUp,
    AlertCircle,
} from 'lucide-react';

// Dynamic import for Leaflet (SSR-incompatible)
const MapPicker = dynamic(() => import('@/components/MapPicker'), {
    ssr: false,
    loading: () => (
        <div className="flex h-[320px] items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
                <Map className="h-8 w-8 animate-pulse" />
                <span className="text-sm">Loading map...</span>
            </div>
        </div>
    ),
});

export default function CreateTripPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [routeDistance, setRouteDistance] = useState<number | null>(null);

    const [form, setForm] = useState({
        fromCity: '',
        toCity: '',
        gatheringLocation: '',
        toAddress: '',
        departureTime: '',
        pricePerSeat: '',
        totalSeats: '4',
        notes: '',
        gatheringLatitude: undefined as number | undefined,
        gatheringLongitude: undefined as number | undefined,
        destinationLatitude: undefined as number | undefined,
        destinationLongitude: undefined as number | undefined,
    });

    const update = (field: string, value: any) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleGatheringChange = (lat: number, lng: number, address?: string) => {
        setForm((prev) => ({
            ...prev,
            gatheringLatitude: lat,
            gatheringLongitude: lng,
            gatheringLocation: address || prev.gatheringLocation,
        }));
    };

    const handleDestinationChange = (lat: number, lng: number, address?: string) => {
        setForm((prev) => ({
            ...prev,
            destinationLatitude: lat,
            destinationLongitude: lng,
            toAddress: address || prev.toAddress,
        }));
    };

    // Dynamic pricing calculations
    const pricingInfo = useMemo(() => {
        if (!routeDistance || routeDistance <= 0) return null;

        const rawSuggested = routeDistance * 5;
        const suggested = Math.max(20, Math.min(85, Math.round(rawSuggested)));
        const minAllowed = Math.max(20, Math.round(suggested * 0.8));
        const maxAllowed = Math.min(85, Math.round(suggested * 1.2));

        return { suggested, minAllowed, maxAllowed, distance: routeDistance };
    }, [routeDistance]);

    // Auto-fill suggested price when distance is calculated
    const handleDistanceCalculated = (distanceKm: number) => {
        setRouteDistance(distanceKm);
        if (!form.pricePerSeat) {
            const rawSuggested = distanceKm * 5;
            const suggested = Math.max(20, Math.min(85, Math.round(rawSuggested)));
            update('pricePerSeat', String(suggested));
        }
    };

    const pricePerSeatNum = Number(form.pricePerSeat) || 0;
    const isPriceValid = pricingInfo
        ? pricePerSeatNum >= pricingInfo.minAllowed && pricePerSeatNum <= pricingInfo.maxAllowed
        : pricePerSeatNum > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const totalPrice = pricePerSeatNum * Number(form.totalSeats);
            const response = await api.createTrip({
                fromCity: form.fromCity,
                toCity: form.toCity,
                gatheringLocation: form.gatheringLocation,
                toAddress: form.toAddress || undefined,
                departureTime: new Date(form.departureTime).toISOString(),
                price: totalPrice,
                pricePerSeat: pricePerSeatNum,
                totalSeats: Number(form.totalSeats),
                notes: form.notes || undefined,
                gatheringLatitude: form.gatheringLatitude,
                gatheringLongitude: form.gatheringLongitude,
                destinationLatitude: form.destinationLatitude,
                destinationLongitude: form.destinationLongitude,
            });
            if (response.data) {
                router.push(`/trips/${response.data.id}`);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create trip');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN']}>
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
                            <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                Create a Trip
                            </h1>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Share your ride and earn money
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Route - Cities as text inputs */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                <MapPin className="h-3.5 w-3.5 text-teal-500" /> From City
                            </label>
                            <input
                                type="text"
                                required
                                value={form.fromCity}
                                onChange={(e) => update('fromCity', e.target.value)}
                                placeholder="e.g. Cairo"
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                <MapPin className="h-3.5 w-3.5 text-indigo-500" /> To City
                            </label>
                            <input
                                type="text"
                                required
                                value={form.toCity}
                                onChange={(e) => update('toCity', e.target.value)}
                                placeholder="e.g. Alexandria"
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                        </div>
                    </div>

                    {/* Interactive Map — with GPS auto-detect */}
                    <div>
                        <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <Map className="h-3.5 w-3.5 text-indigo-500" /> Pick Locations on Map
                        </label>
                        <MapPicker
                            gatheringLat={form.gatheringLatitude}
                            gatheringLng={form.gatheringLongitude}
                            destinationLat={form.destinationLatitude}
                            destinationLng={form.destinationLongitude}
                            onGatheringChange={handleGatheringChange}
                            onDestinationChange={handleDestinationChange}
                            useCurrentLocation={true}
                            onDistanceCalculated={handleDistanceCalculated}
                        />
                    </div>

                    {/* Group Point & Destination Point */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                <Navigation className="h-3.5 w-3.5 text-cyan-500" /> Group Point
                            </label>
                            <input
                                required
                                value={form.gatheringLocation}
                                onChange={(e) => update('gatheringLocation', e.target.value)}
                                placeholder="e.g. Ramsis Station, Gate 5"
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                            {form.gatheringLatitude && (
                                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    📍 Coordinates set from map
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                <Flag className="h-3.5 w-3.5 text-rose-500" /> Destination Point
                            </label>
                            <input
                                value={form.toAddress}
                                onChange={(e) => update('toAddress', e.target.value)}
                                placeholder="e.g. Sidi Gaber Station"
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                            {form.destinationLatitude && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                                    📍 Coordinates set from map
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Departure + Seats */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                <CalendarDays className="h-3.5 w-3.5 text-indigo-500" /> Departure
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={form.departureTime}
                                onChange={(e) => update('departureTime', e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                <Users className="h-3.5 w-3.5 text-indigo-500" /> Available Seats
                            </label>
                            <select
                                value={form.totalSeats}
                                onChange={(e) => update('totalSeats', e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            >
                                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dynamic Price Per Seat */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <CreditCard className="h-3.5 w-3.5 text-teal-500" /> Price per Seat (EGP)
                        </label>

                        {/* Pricing guidance */}
                        {pricingInfo && (
                            <div className="mb-2 rounded-lg bg-gradient-to-r from-teal-50 to-indigo-50 p-3 dark:from-teal-900/10 dark:to-indigo-900/10">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
                                    <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                                        Dynamic Pricing ({pricingInfo.distance} km route)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                        Suggested: <strong className="text-teal-700 dark:text-teal-300">{pricingInfo.suggested} EGP</strong>
                                    </span>
                                    <span className="text-[10px] text-zinc-400">•</span>
                                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                        Range: <strong>{pricingInfo.minAllowed}</strong> – <strong>{pricingInfo.maxAllowed}</strong> EGP
                                    </span>
                                </div>
                                {/* Range slider visualization */}
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-500">{pricingInfo.minAllowed}</span>
                                    <div className="relative flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
                                        <div
                                            className="absolute h-2 rounded-full bg-gradient-to-r from-teal-400 to-indigo-400"
                                            style={{
                                                left: '0%',
                                                width: '100%',
                                            }}
                                        />
                                        {pricePerSeatNum >= pricingInfo.minAllowed && pricePerSeatNum <= pricingInfo.maxAllowed && (
                                            <div
                                                className="absolute -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-teal-600 shadow-md"
                                                style={{
                                                    left: `${((pricePerSeatNum - pricingInfo.minAllowed) / (pricingInfo.maxAllowed - pricingInfo.minAllowed)) * 100}%`,
                                                }}
                                            />
                                        )}
                                    </div>
                                    <span className="text-[10px] text-zinc-500">{pricingInfo.maxAllowed}</span>
                                </div>
                            </div>
                        )}

                        <input
                            type="number"
                            required
                            min={pricingInfo?.minAllowed || 20}
                            max={pricingInfo?.maxAllowed || 85}
                            value={form.pricePerSeat}
                            onChange={(e) => update('pricePerSeat', e.target.value)}
                            placeholder={pricingInfo ? `${pricingInfo.suggested}` : "40"}
                            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-zinc-100 ${
                                !isPriceValid && form.pricePerSeat
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-zinc-300 focus:border-teal-500 focus:ring-teal-500/20 dark:border-zinc-700'
                            }`}
                        />

                        {!isPriceValid && form.pricePerSeat && pricingInfo && (
                            <div className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                Price must be between {pricingInfo.minAllowed} and {pricingInfo.maxAllowed} EGP (±20% of suggested)
                            </div>
                        )}

                        {/* Total price calculation */}
                        {pricePerSeatNum > 0 && (
                            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                Total trip price: <strong className="text-zinc-900 dark:text-zinc-100">{pricePerSeatNum * Number(form.totalSeats)} EGP</strong>
                                {' '}({form.totalSeats} seats × {pricePerSeatNum} EGP)
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <StickyNote className="h-3.5 w-3.5 text-violet-500" /> Notes (optional)
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => update('notes', e.target.value)}
                            rows={3}
                            placeholder="Any additional info (AC available, luggage space, etc.)"
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || (!isPriceValid && !!form.pricePerSeat)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-teal-700 hover:to-indigo-700 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Create Trip
                            </>
                        )}
                    </button>
                </form>
            </div>
        </ProtectedRoute>
    );
}
