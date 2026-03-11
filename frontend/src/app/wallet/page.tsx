'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { WalletCard } from '@/components/wallet/WalletCard';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import {
    TrendingUp,
    Car,
    DollarSign,
    Percent,
    Phone,
    Calendar,
} from 'lucide-react';

interface WeeklyStats {
    totalTrips: number;
    grossIncome: number;
    netIncome: number;
    commission: number;
    commissionRate: number;
    instapayPhone: string;
    weekStart: string;
}

export default function WalletPage() {
    const { user } = useAuthStore();
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'DRIVER') {
            setStatsLoading(true);
            api.getDriverWeeklyStats()
                .then((res) => setWeeklyStats(res.data as WeeklyStats))
                .catch(() => { })
                .finally(() => setStatsLoading(false));
        }
    }, [user]);

    return (
        <ProtectedRoute>
            <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center py-8 px-4 sm:py-12 sm:px-6">
                <div className="w-full max-w-2xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                            My Wallet
                        </h1>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            Manage your balance, deposit funds, and view transaction history.
                        </p>
                    </div>

                    {/* Driver Weekly Stats */}
                    {user?.role === 'DRIVER' && (
                        <div className="mb-6">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                <Calendar className="h-5 w-5 text-teal-500" />
                                This Week&apos;s Summary
                            </h2>

                            {statsLoading ? (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="animate-pulse rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
                                            <div className="h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
                                            <div className="mt-2 h-6 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
                                        </div>
                                    ))}
                                </div>
                            ) : weeklyStats ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Car className="h-4 w-4 text-teal-500" />
                                                <span className="text-xs font-medium">Total Trips</span>
                                            </div>
                                            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                                                {weeklyStats.totalTrips}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                                <span className="text-xs font-medium">Net Income</span>
                                            </div>
                                            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                {weeklyStats.netIncome.toFixed(0)}
                                                <span className="ml-1 text-sm font-normal text-zinc-500">EGP</span>
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Percent className="h-4 w-4 text-indigo-500" />
                                                <span className="text-xs font-medium">Commission ({weeklyStats.commissionRate}%)</span>
                                            </div>
                                            <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {weeklyStats.commission.toFixed(0)}
                                                <span className="ml-1 text-sm font-normal text-zinc-500">EGP</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* InstaPay Phone */}
                                    <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
                                                    Company InstaPay Number
                                                </p>
                                                <p className="text-xs text-teal-600 dark:text-teal-400">
                                                    Send your weekly commission via InstaPay to:
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-mono text-lg font-bold text-teal-700 shadow-sm dark:bg-zinc-800 dark:text-teal-400">
                                                <Phone className="h-4 w-4" />
                                                {weeklyStats.instapayPhone}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-500">No stats available</p>
                            )}
                        </div>
                    )}

                    <WalletCard />
                </div>
            </div>
        </ProtectedRoute>
    );
}
