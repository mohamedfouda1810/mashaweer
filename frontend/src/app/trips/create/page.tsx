'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
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
} from 'lucide-react';

export default function CreateTripPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        fromCity: '',
        toCity: '',
        gatheringLocation: '',
        toAddress: '',
        departureTime: '',
        price: '',
        totalSeats: '4',
        notes: '',
    });

    const update = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.createTrip({
                fromCity: form.fromCity,
                toCity: form.toCity,
                gatheringLocation: form.gatheringLocation,
                toAddress: form.toAddress || undefined,
                departureTime: new Date(form.departureTime).toISOString(),
                price: Number(form.price),
                totalSeats: Number(form.totalSeats),
                notes: form.notes || undefined,
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
                        </div>
                    </div>

                    {/* Departure, Price, Seats */}
                    <div className="grid gap-4 sm:grid-cols-3">
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
                                <CreditCard className="h-3.5 w-3.5 text-teal-500" /> Price (EGP)
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={form.price}
                                onChange={(e) => update('price', e.target.value)}
                                placeholder="150"
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
                        disabled={isLoading}
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
