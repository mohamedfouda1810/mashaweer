'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { Mail, Lock, Loader2, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

export default function LoginPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { login, isAuthenticated, hasHydrated } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (hasHydrated && isAuthenticated) {
            router.replace('/trips');
        }
    }, [hasHydrated, isAuthenticated, router]);

    if (!hasHydrated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-500" />
            </div>
        );
    }

    if (isAuthenticated) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.login(email, password);
            if (response.data) {
                login(response.data.token, response.data.user);
                toast.success('Welcome back!');
                router.push('/trips');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12 gradient-hero overflow-hidden">
            {/* Liquid Orbs for Glassmorphism Background */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-navy/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-emerald-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="glass mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg animate-scale-in relative">
                        <Lock className="absolute -top-2 -right-2 h-5 w-5 text-emerald-500 bg-white dark:bg-zinc-800 rounded-full p-0.5 shadow-sm" />
                        <Image src="/mashaweer-logo.png" alt={t('common.mashaweer')} width={40} height={40} className="h-10 w-10 object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                        {t('login.title')}
                    </h1>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        {t('login.subtitle')}
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full">
                        <Shield className="h-3.5 w-3.5" />
                        <span>🔒 {t('login.secureLogin')}</span>
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up md:hover-lift bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-xl"
                >
                    {error && (
                        <div className="rounded-xl bg-red-50/90 dark:bg-red-950/50 p-3 text-sm text-red-700 dark:text-red-400 backdrop-blur-sm border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {t('login.email')}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-zinc-200/50 bg-white/50 py-3 pl-10 pr-3 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-100 backdrop-blur-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-center justify-between">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                {t('login.password')}
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                            >
                                {t('login.forgotPassword')}
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl border border-zinc-200/50 bg-white/50 py-3 pl-10 pr-3 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-100 backdrop-blur-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-3d btn-liquid flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-emerald py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t('login.signingIn')}
                                </>
                            ) : (
                                <>
                                    {t('login.signIn')}
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                        <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
                            <Shield className="h-3 w-3" />
                            {t('common.secureEncrypted')}
                        </p>
                    </div>

                    <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50 mt-6">
                        {t('login.noAccount')}{' '}
                        <Link
                            href="/register"
                            className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                        >
                            {t('common.register')}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
