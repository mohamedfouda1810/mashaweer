'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const { t } = useTranslation();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await api.resetPassword(token, newPassword);
            setSuccess(true);
            toast.success(t('reset.success') || 'Password reset successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center py-16">
                <p className="text-zinc-600 dark:text-zinc-400">Invalid reset link. Please request a new password reset.</p>
                <Link href="/forgot-password" className="mt-4 inline-block font-medium text-emerald-600 hover:underline">
                    Go to Forgot Password
                </Link>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 overflow-hidden gradient-hero">
            {/* Liquid Orbs */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-emerald-600/20" />
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-navy/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-blue-600/20" />
            
            <div className="relative w-full max-w-md z-10">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl glass shadow-lg shadow-navy/10 border border-white/20 dark:border-zinc-700/50 hover-lift">
                        <Image src="/mashaweer-logo.png" alt="Mashaweer" width={48} height={48} className="h-12 w-12 object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-navy dark:text-white drop-shadow-sm">
                        {success ? t('reset.success') : t('reset.title')}
                    </h1>
                    <p className="mt-2 text-base text-zinc-700 dark:text-zinc-300">
                        {success ? 'Your password has been updated.' : t('reset.subtitle')}
                    </p>
                </div>

                {success ? (
                    <div className="space-y-6 rounded-3xl glass-card border border-white/40 p-8 shadow-xl dark:border-zinc-800/50 backdrop-blur-xl">
                        <div className="flex flex-col items-center py-4">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            </div>
                            <p className="text-center text-zinc-700 dark:text-zinc-300 font-medium">
                                You can now sign in with your new password.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="btn-3d flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-navy to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 rounded-3xl glass-card border border-white/40 p-8 shadow-xl dark:border-zinc-800/50 backdrop-blur-xl"
                    >
                        {error && (
                            <div className="rounded-xl bg-red-50/80 p-4 text-sm font-medium text-red-700 border border-red-200 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-navy dark:text-zinc-200">
                                {t('reset.newPassword')}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-emerald-500" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-zinc-200/50 bg-white/50 py-3.5 pl-11 pr-4 text-sm text-zinc-900 backdrop-blur-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700/50 dark:bg-zinc-900/50 dark:text-white dark:focus:bg-zinc-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-navy dark:text-zinc-200">
                                {t('reset.confirmPassword')}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-emerald-500" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-zinc-200/50 bg-white/50 py-3.5 pl-11 pr-4 text-sm text-zinc-900 backdrop-blur-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700/50 dark:bg-zinc-900/50 dark:text-white dark:focus:bg-zinc-900"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-3d flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-60"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {t('reset.resetting')}
                                </>
                            ) : (
                                t('reset.submit')
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-500" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
