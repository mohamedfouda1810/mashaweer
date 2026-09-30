'use client';

import React, { useRef, useCallback } from 'react';
import { useTripStore } from '@/stores/useTripStore';
import { useTranslation } from '@/hooks/useTranslation';
import {
    Search,
    CalendarDays,
    MapPin,
    DollarSign,
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
    const { filters, setFilters, resetFilters } = useTripStore();
    const { t } = useTranslation();
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false); // collapsed on mobile by default

    // Local state for the search input to enable debouncing
    const [searchValue, setSearchValue] = React.useState(filters.q || '');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced search: waits 400ms after typing stops before triggering fetch
    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setFilters({ q: value });
        }, 400);
    }, [setFilters]);

    // Cleanup debounce timer on unmount
    React.useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const handleApply = () => {
        // Commit local search value immediately and trigger fetch
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setFilters({ q: searchValue });
        // Collapse on mobile after search (SSR-safe)
        if (typeof window !== 'undefined' && window.innerWidth < 768) setIsExpanded(false);
    };

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchValue('');
        resetFilters();
    };

    const hasActiveFilters =
        filters.q ||
        filters.fromCity ||
        filters.toCity ||
        filters.date ||
        filters.minPrice ||
        filters.maxPrice;

    const inputClass =
        'w-full rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-100';

    return (
        <div className="glass-card rounded-2xl shadow-sm mb-6">
            {/* Header — toggleable on mobile */}
            <div className="flex w-full items-center justify-between px-5 py-4">
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex flex-1 items-center justify-between md:cursor-default"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100/50 rounded-lg dark:bg-emerald-900/30">
                            <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 drop-shadow-sm">
                            {t('trips.filter.title')}
                        </span>
                        {hasActiveFilters && (
                            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm">
                                !
                            </span>
                        )}
                    </div>
                    <span className="text-zinc-400 md:hidden mr-2">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                </button>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50/50 hover:bg-red-100 transition-colors border border-red-100 dark:border-red-900/30 dark:bg-red-950/30 dark:hover:bg-red-900/50"
                    >
                        {t('trips.filter.clear')}
                    </button>
                )}
            </div>

            {/* Filter body — always visible on desktop, toggle on mobile */}
            <div className={`${isExpanded ? 'block' : 'hidden'} md:block border-t border-zinc-100/50 px-5 pb-5 pt-4 dark:border-zinc-800/50`}>
                {/* Unified Search Box */}
                <div className="mb-4">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        <Search className="h-3.5 w-3.5 text-emerald-500" />
                        {t('trips.filter.search')}
                    </label>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleApply();
                        }}
                        placeholder={t('trips.filter.searchPlaceholder')}
                        className={inputClass}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* From City */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                            {t('common.from')}
                        </label>
                        <select
                            value={filters.fromCity || ''}
                            onChange={(e) => setFilters({ fromCity: e.target.value })}
                            className={inputClass}
                        >
                            <option value="">{t('trips.filter.allCities')}</option>
                            {POPULAR_CITIES.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* To City */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                            <MapPin className="h-3.5 w-3.5 text-navy dark:text-blue-400" />
                            {t('common.to')}
                        </label>
                        <select
                            value={filters.toCity || ''}
                            onChange={(e) => setFilters({ toCity: e.target.value })}
                            className={inputClass}
                        >
                            <option value="">{t('trips.filter.allDestinations')}</option>
                            {POPULAR_CITIES.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                            <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
                            {t('common.date')}
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
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-emerald px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:from-navy-light hover:to-emerald-500 active:scale-95"
                        >
                            <Search className="h-4 w-4" />
                            {t('common.search')}
                        </button>
                    </div>
                </div>

                {/* Price Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="mt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
                >
                    {showAdvanced ? t('trips.filter.hidePrice') : t('trips.filter.showPrice')}
                </button>

                {/* Price Range */}
                {showAdvanced && (
                    <div className="mt-3 grid gap-4 border-t border-zinc-100/50 pt-4 sm:grid-cols-2 dark:border-zinc-800/50">
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                {t('trips.filter.minPrice')}
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
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                {t('trips.filter.maxPrice')}
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
