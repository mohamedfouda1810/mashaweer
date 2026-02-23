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
    ChevronDown,
    ChevronUp,
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
    const [isExpanded, setIsExpanded] = React.useState(false); // collapsed on mobile by default

    const handleApply = () => {
        fetchTrips();
        // Collapse on mobile after search
        if (window.innerWidth < 768) setIsExpanded(false);
    };

    const hasActiveFilters =
        filters.fromCity ||
        filters.toCity ||
        filters.date ||
        filters.minPrice ||
        filters.maxPrice;

    const inputClass =
        'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';

    return (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header — always visible, acts as toggle on mobile */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between px-4 py-3 md:cursor-default"
            >
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Filter Trips
                    </span>
                    {hasActiveFilters && (
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            !
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                resetFilters();
                                fetchTrips();
                            }}
                            className="text-xs text-red-500 hover:text-red-600"
                        >
                            Clear
                        </span>
                    )}
                    <span className="text-zinc-400 md:hidden">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                </div>
            </button>

            {/* Filter body — always visible on desktop, toggle on mobile */}
            <div className={`${isExpanded ? 'block' : 'hidden'} md:block border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800`}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* From City */}
                    <div>
                        <label className="mb-1 flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            <MapPin className="h-3 w-3 text-amber-500" />
                            From
                        </label>
                        <select
                            value={filters.fromCity || ''}
                            onChange={(e) => setFilters({ fromCity: e.target.value })}
                            className={inputClass}
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
                        <label className="mb-1 flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            <MapPin className="h-3 w-3 text-emerald-500" />
                            To
                        </label>
                        <select
                            value={filters.toCity || ''}
                            onChange={(e) => setFilters({ toCity: e.target.value })}
                            className={inputClass}
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
                        <label className="mb-1 flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            <CalendarDays className="h-3 w-3 text-amber-500" />
                            Date
                        </label>
                        <input
                            type="date"
                            value={filters.date || ''}
                            onChange={(e) => setFilters({ date: e.target.value })}
                            className={inputClass}
                        />
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleApply}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-md active:scale-95"
                        >
                            <Search className="h-4 w-4" />
                            Search
                        </button>
                    </div>
                </div>

                {/* Price Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="mt-2 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400"
                >
                    {showAdvanced ? 'Hide' : 'Show'} Price Filters
                </button>

                {/* Price Range */}
                {showAdvanced && (
                    <div className="mt-2 grid gap-3 border-t border-zinc-100 pt-3 sm:grid-cols-2 dark:border-zinc-800">
                        <div>
                            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                <DollarSign className="h-3 w-3 text-amber-500" />
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
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                <DollarSign className="h-3 w-3 text-amber-500" />
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
                                className={inputClass}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
