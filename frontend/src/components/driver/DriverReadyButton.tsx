'use client';

import React from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { CheckCircle2, AlertTriangle, Clock, Car } from 'lucide-react';

interface DriverReadyButtonProps {
    tripId: string;
    departureTime: string;
    isConfirmed: boolean;
}

export function DriverReadyButton({
    tripId,
    departureTime,
    isConfirmed,
}: DriverReadyButtonProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [confirmedNow, setConfirmedNow] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const departure = new Date(departureTime);
    const now = new Date();
    const minutesUntilDeparture =
        (departure.getTime() - now.getTime()) / (1000 * 60);

    // Show button within 60 minutes of departure
    const canConfirm = minutesUntilDeparture <= 60 && minutesUntilDeparture > 0;
    const isUrgent = minutesUntilDeparture <= 15;
    const alreadyConfirmed = isConfirmed || confirmedNow;

    const handleConfirm = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await api.confirmReady(tripId);
            setConfirmedNow(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (alreadyConfirmed) {
        return (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">You&apos;re confirmed ready!</span>
            </div>
        );
    }

    if (!canConfirm) {
        return (
            <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-4 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <Clock className="h-5 w-5" />
                <span className="text-sm">
                    &quot;I&apos;m Ready&quot; button appears 60 minutes before departure
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {isUrgent && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4 animate-pulse" />
                    <span>
                        ⚠️ Less than 15 minutes! Confirm now to avoid a no-show alert.
                    </span>
                </div>
            )}

            <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all active:scale-95 ${isUrgent
                        ? 'animate-pulse bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                    }`}
            >
                <Car className="h-6 w-6" />
                {isLoading ? 'Confirming...' : "I'm Ready! 🚗"}
            </button>

            {error && (
                <p className="text-center text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}

            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                {Math.round(minutesUntilDeparture)} minutes until departure
            </p>
        </div>
    );
}
