'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { WalletCard } from '@/components/wallet/WalletCard';
import { Wallet } from 'lucide-react';

export default function WalletPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                <Wallet className="mb-4 h-12 w-12 text-zinc-300" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Sign in required</h2>
                <button onClick={() => router.push('/login')} className="mt-3 text-blue-600 hover:underline">
                    Go to login
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                    <Wallet className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Wallet</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage funds and view transactions</p>
                </div>
            </div>

            <WalletCard />
        </div>
    );
}
