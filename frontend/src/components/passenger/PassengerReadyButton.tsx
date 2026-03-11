'use client';

import React from 'react';
import { api } from '@/lib/api';
import { CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

interface PassengerReadyButtonProps {
    bookingId: string;
    departureTime: string;
    isReady: boolean;
    onReady: () => void;
}

export function PassengerReadyButton({
    bookingId,
    departureTime,
    isReady,
    onReady
}: PassengerReadyButtonProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const departure = new Date(departureTime);
    const now = new Date();
    const minutesUntilDeparture =
        (departure.getTime() - now.getTime()) / (1000 * 60);

    // Show button within 60 minutes of departure
    const canConfirm = minutesUntilDeparture <= 60 && minutesUntilDeparture > 0;
    const isUrgent = minutesUntilDeparture <= 15;

    const handleReady = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await api.confirmPassengerReady(bookingId);
            onReady();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isReady) {
        return (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">You're ready for the trip</span>
            </div>
        );
    }

    if (!canConfirm) {
        return null;
    }

    return (
        <div className="mt-4 space-y-2">
            {isUrgent && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3 animate-pulse" />
                    <span>Confirm you're ready to leave now!</span>
                </div>
            )}

            <button
                onClick={handleReady}
                disabled={isLoading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow transition-all active:scale-95 ${isUrgent
                    ? 'animate-pulse bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600'
                    }`}
            >
                <UserCheck className="h-4 w-4" />
                {isLoading ? 'Confirming...' : "I'm Ready to go!"}
            </button>

            {error && (
                <p className="text-center text-xs text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}
