'use client';

import React from 'react';
import { useTripStore } from '@/stores/useTripStore';
import {
    Search,
    CalendarDays,
    MapPin,
    DollarSign,
    X,
    SlidersHorizontal,
} from 'lucide-react';

const POPULAR_CITIES = [
    'Cairo',
    'Alexandria',
    'Hurghada',
    'Luxor',
    'Aswan',
    'Sharm El Sheikh',
    'Mansoura',
    'Tanta',
    'Ismailia',
    'Port Said',
];

export function TripFilters() {
    const { filters, setFilters, resetFilters, fetchTrips } = useTripStore();
    const [showAdvanced, setShowAdvanced] = React.useState(false);

    const handleApply = () => {
        fetchTrips();
    };

    const hasActiveFilters =
        filters.fromCity ||
        filters.toCity ||
        filters.date ||
        filters.minPrice ||
        filters.maxPrice;

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Filter Trips
                    </h2>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={() => {
                            resetFilters();
                            fetchTrips();
                        }}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear All
                    </button>
                )}
            </div>

            {/* Main Filters */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* From City */}
                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        From
                    </label>
                    <select
                        value={filters.fromCity || ''}
                        onChange={(e) => setFilters({ fromCity: e.target.value })}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                        <option value="">All Cities</option>
                        {POPULAR_CITIES.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>

                {/* To City */}
                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                        To
                    </label>
                    <select
                        value={filters.toCity || ''}
                        onChange={(e) => setFilters({ toCity: e.target.value })}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                        <option value="">All Destinations</option>
                        {POPULAR_CITIES.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date */}
                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
                        Date
                    </label>
                    <input
                        type="date"
                        value={filters.date || ''}
                        onChange={(e) => setFilters({ date: e.target.value })}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                    <button
                        onClick={handleApply}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md active:scale-95"
                    >
                        <Search className="h-4 w-4" />
                        Search Trips
                    </button>
                </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
                {showAdvanced ? 'Hide' : 'Show'} Price Filters
            </button>

            {/* Price Range (Advanced) */}
            {showAdvanced && (
                <div className="mt-3 grid gap-3 border-t border-zinc-100 pt-4 md:grid-cols-2 dark:border-zinc-800">
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <DollarSign className="h-3.5 w-3.5 text-amber-500" />
                            Min Price (EGP)
                        </label>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.minPrice ?? ''}
                            onChange={(e) =>
                                setFilters({
                                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                                })
                            }
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <DollarSign className="h-3.5 w-3.5 text-amber-500" />
                            Max Price (EGP)
                        </label>
                        <input
                            type="number"
                            min="0"
                            placeholder="500"
                            value={filters.maxPrice ?? ''}
                            onChange={(e) =>
                                setFilters({
                                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                                })
                            }
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
