'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/hooks/useTranslation';
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
        <div className="flex h-[320px] items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 glass-card">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
                <Map className="h-8 w-8 animate-pulse" />
                <span className="text-sm">Loading map...</span>
            </div>
        </div>
    ),
});

interface BackendPricing {
    distanceKm: number;
    suggestedTripPrice: number;
    seats: number;
    suggestedPricePerSeat: number;
    minPricePerSeat: number;
    maxPricePerSeat: number;
    clampedMin: number;
    clampedMax: number;
}

export default function CreateTripPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [routeDistance, setRouteDistance] = useState<number | null>(null);

    // Backend-authoritative pricing — NO local recalculation
    const [pricingInfo, setPricingInfo] = useState<BackendPricing | null>(null);
    const [pricingLoading, setPricingLoading] = useState(false);

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

    // Fetch pricing from backend (SINGLE SOURCE OF TRUTH)
    const fetchPricing = useCallback(async (distanceKm: number, seats: number) => {
        if (distanceKm <= 0) {
            setPricingInfo(null);
            return;
        }
        setPricingLoading(true);
        try {
            const res = await api.calculatePricing(distanceKm, seats);
            if (res.data) {
                setPricingInfo(res.data);
                // Auto-fill suggested price if user hasn't manually changed it
                if (!form.pricePerSeat || form.pricePerSeat === String(pricingInfo?.suggestedPricePerSeat)) {
                    update('pricePerSeat', String(res.data.suggestedPricePerSeat));
                }
            }
        } catch {
            // Silently fail — user can still manually enter price
        } finally {
            setPricingLoading(false);
        }
    }, [form.pricePerSeat, pricingInfo?.suggestedPricePerSeat]);

    // Re-fetch pricing when distance or seats change
    useEffect(() => {
        if (routeDistance && routeDistance > 0) {
            fetchPricing(routeDistance, Number(form.totalSeats) || 4);
        }
    }, [routeDistance, form.totalSeats, fetchPricing]);

    // Distance callback from MapPicker
    const handleDistanceCalculated = (distanceKm: number) => {
        setRouteDistance(distanceKm);
    };

    const pricePerSeatNum = Number(form.pricePerSeat) || 0;
    const isPriceValid = pricingInfo
        ? pricePerSeatNum >= pricingInfo.minPricePerSeat && pricePerSeatNum <= pricingInfo.maxPricePerSeat
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
                // Send OSRM road-distance so backend uses the SAME distance
                distanceKm: routeDistance || undefined,
            } as any);
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
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 relative">
                {/* Background gradient blur */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-navy-900/10 to-transparent blur-2xl"></div>

                <div className="mb-8 hover-lift">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100/50 backdrop-blur-sm dark:bg-teal-900/30">
                            <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {t('createTrip.title') || 'Create a Trip'}
                            </h1>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {t('createTrip.subtitle') || 'Share your ride and earn money'}
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-2xl glass-card p-6 shadow-xl"
                >
                    {error && (
                        <div className="rounded-lg bg-red-50/80 backdrop-blur-sm p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    {/* Route - Cities as text inputs */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="group">
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-teal-500">
                                <MapPin className="h-3.5 w-3.5 text-teal-500" /> {t('createTrip.fromCity') || 'From City'}
                            </label>
                            <input
                                type="text"
                                required
                                value={form.fromCity}
                                onChange={(e) => update('fromCity', e.target.value)}
                                placeholder="e.g. Cairo"
                                className="w-full rounded-lg border border-white/20 bg-white/50 backdrop-blur-md px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 transition-all hover:bg-white/60 dark:hover:bg-zinc-800/60"
                            />
                        </div>
                        <div className="group">
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-emerald-500">
                                <MapPin className="h-3.5 w-3.5 text-emerald-500" /> {t('createTrip.toCity') || 'To City'}
                            </label>
                            <input
                                type="text"
                                required
                                value={form.toCity}
                                onChange={(e) => update('toCity', e.target.value)}
                                placeholder="e.g. Alexandria"
                                className="w-full rounded-lg border border-white/20 bg-white/50 backdrop-blur-md px-3 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 transition-all hover:bg-white/60 dark:hover:bg-zinc-800/60"
                            />
                        </div>
                    </div>

                    {/* Interactive Map — with GPS auto-detect */}
                    <div>
                        <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <Map className="h-3.5 w-3.5 text-emerald-500" /> {t('createTrip.pickLocationsOnMap') || 'Pick Locations on Map'}
                        </label>
                        <div className="glass-card overflow-hidden rounded-xl">
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
                    </div>

                    {/* Group Point & Destination Point */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="group">
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-teal-500">
                                <Navigation className="h-3.5 w-3.5 text-teal-500" /> {t('createTrip.gatheringLocation') || 'Gathering Location'}
                            </label>
                            <input
                                required
                                value={form.gatheringLocation}
                                onChange={(e) => update('gatheringLocation', e.target.value)}
                                placeholder="e.g. Ramsis Station, Gate 5"
                                className="w-full rounded-lg border border-white/20 bg-white/50 backdrop-blur-md px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 transition-all hover:bg-white/60 dark:hover:bg-zinc-800/60"
                            />
                            {form.gatheringLatitude && (
                                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                                    Coordinates set from map
                                </p>
                            )}
                        </div>
                        <div className="group">
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-emerald-500">
                                <Flag className="h-3.5 w-3.5 text-emerald-500" /> {t('createTrip.destinationPoint') || 'Destination Point'}
                            </label>
                            <input
                                value={form.toAddress}
                                onChange={(e) => update('toAddress', e.target.value)}
                                placeholder="e.g. Sidi Gaber Station"
                                className="w-full rounded-lg border border-white/20 bg-white/50 backdrop-blur-md px-3 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 transition-all hover:bg-white/60 dark:hover:bg-zinc-800/60"
                            />
                            {form.destinationLatitude && (
                                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                                    Coordinates set from map
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Departure + Seats */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="group">
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-teal-500">
                                <CalendarDays className="h-3.5 w-3.5 text-teal-500" /> {t('createTrip.departureTime') || 'Departure Time'}
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={form.departureTime}
                                onChange={(e) => update('departureTime', e.target.value)}
                                className="w-full rounded-lg border border-white/20 bg-white/50 backdrop-blur-md px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 transition-all hover:bg-white/60 dark:hover:bg-zinc-800/60"
                            />
                        </div>
                        <div className="group">
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-teal-500">
                                <Users className="h-3.5 w-3.5 text-teal-500" /> {t('createTrip.totalSeats') || 'Available Seats'}
                            </label>
                            <select
                                value={form.totalSeats}
                                onChange={(e) => update('totalSeats', e.target.value)}
                                className="w-full rounded-lg border border-white/20 bg-white/50 backdrop-blur-md px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 transition-all hover:bg-white/60 dark:hover:bg-zinc-800/60"
                            >
                                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                    <option key={n} value={n} className="bg-white dark:bg-zinc-800">{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dynamic Price Per Seat — values from BACKEND */}
                    <div className="group">
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-emerald-500">
                            <CreditCard className="h-3.5 w-3.5 text-emerald-500" /> {t('createTrip.pricePerSeat') || 'Price per Seat (EGP)'}
                        </label>

                        {/* Pricing guidance — ALL values from backend */}
                        {pricingInfo && (
                            <div className="mb-2 rounded-lg bg-gradient-to-r from-teal-50/50 to-emerald-50/50 p-3 backdrop-blur-sm dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-100 dark:border-teal-900/30">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
                                    <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                                        Dynamic Pricing ({pricingInfo.distanceKm} km route)
                                    </span>
                                    {pricingLoading && (
                                        <Loader2 className="h-3 w-3 animate-spin text-teal-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                        Suggested: <strong className="text-emerald-600 dark:text-emerald-400">{pricingInfo.suggestedPricePerSeat} EGP</strong>
                                    </span>
                                    <span className="text-[10px] text-zinc-400">•</span>
                                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                        Range: <strong>{pricingInfo.minPricePerSeat}</strong> – <strong>{pricingInfo.maxPricePerSeat}</strong> EGP
                                    </span>
                                </div>
                                {/* Range slider visualization */}
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-500">{pricingInfo.minPricePerSeat}</span>
                                    <div className="relative flex-1 h-2 rounded-full bg-black/5 dark:bg-white/10 shadow-inner">
                                        <div
                                            className="absolute h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                                            style={{
                                                left: '0%',
                                                width: '100%',
                                            }}
                                        />
                                        {pricePerSeatNum >= pricingInfo.minPricePerSeat && pricePerSeatNum <= pricingInfo.maxPricePerSeat && (
                                            <div
                                                className="absolute -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-600 shadow-md transition-all duration-300 ease-out"
                                                style={{
                                                    left: `${((pricePerSeatNum - pricingInfo.minPricePerSeat) / (pricingInfo.maxPricePerSeat - pricingInfo.minPricePerSeat)) * 100}%`,
                                                }}
                                            />
                                        )}
                                    </div>
                                    <span className="text-[10px] text-zinc-500">{pricingInfo.maxPricePerSeat}</span>
                                </div>
                            </div>
                        )}

                        <input
                            type="number"
                            required
                            min={pricingInfo?.minPricePerSeat || 20}
                            max={pricingInfo?.maxPricePerSeat || 85}
                            step="1"
                            value={form.pricePerSeat}
                            onChange={(e) => {
                                const val = e.target.value;
                                update('pricePerSeat', val);
                            }}
                            placeholder={pricingInfo ? `${pricingInfo.suggestedPricePerSeat}` : "40"}
                            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all bg-white/50 backdrop-blur-md dark:bg-zinc-900/50 hover:bg-white/60 dark:hover:bg-zinc-800/60 ${
                                !isPriceValid && form.pricePerSeat
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-100'
                                    : 'border-white/20 focus:border-emerald-500 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100 dark:border-white/10'
                            }`}
                        />

                        {!isPriceValid && form.pricePerSeat && pricingInfo && (
                            <div className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                Price must be between {pricingInfo.minPricePerSeat} and {pricingInfo.maxPricePerSeat} EGP (±20% of suggested)
                            </div>
                        )}

                        {/* Total price calculation */}
                        {pricePerSeatNum > 0 && (
                            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                Total trip price: <strong className="text-emerald-600 dark:text-emerald-400">{pricePerSeatNum * Number(form.totalSeats)} EGP</strong>
                                {' '}({form.totalSeats} seats × {pricePerSeatNum} EGP)
                            </p>
                        )}
                    </div>

                    <div className="group">
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-teal-500">
                            <StickyNote className="h-3.5 w-3.5 text-teal-500" /> {t('createTrip.notes') || 'Notes'}
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => update('notes', e.target.value)}
                            rows={3}
                            placeholder="Any additional info (AC available, luggage space, etc.)"
                            className="w-full rounded-lg border border-white/20 bg-white/50 backdrop-blur-md px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 transition-all hover:bg-white/60 dark:hover:bg-zinc-800/60"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || (!isPriceValid && !!form.pricePerSeat)}
                        className="btn-3d btn-liquid flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-navy to-emerald py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60 overflow-hidden relative"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t('createTrip.creating') || 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    {t('createTrip.submit') || 'Create Trip'}
                                </>
                            )}
                        </span>
                    </button>
                </form>
            </div>
        </ProtectedRoute>
    );
}
