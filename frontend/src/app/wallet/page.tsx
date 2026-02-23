'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { WalletCard } from '@/components/wallet/WalletCard';

export default function WalletPage() {
    return (
        <ProtectedRoute>
            <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center py-12 px-4 sm:px-6">
                <div className="w-full max-w-2xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                            My Wallet
                        </h1>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            Manage your balance, deposit funds, and view transaction history.
                        </p>
                    </div>

                    <WalletCard />
                </div>
            </div>
        </ProtectedRoute>
    );
}
