'use client';

import { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to error reporting service in production
        if (process.env.NODE_ENV === 'production') {
            console.error('[Mashaweer Error]', error.message);
        } else {
            console.error(error);
        }
    }, [error]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Something went wrong
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    An unexpected error occurred. Please try again.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-navy to-mint px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
