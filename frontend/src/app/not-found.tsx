import Link from 'next/link';
import { MapPinOff } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <MapPinOff className="h-8 w-8 text-zinc-400" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Page Not Found
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-navy to-mint px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/trips"
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        Browse Trips
                    </Link>
                </div>
            </div>
        </div>
    );
}
