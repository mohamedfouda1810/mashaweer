'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.forgotPassword(email);
            setSent(true);
            toast.success(t('forgot.success') || 'Check your email for the reset link!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 overflow-hidden gradient-hero">
            {/* Liquid Orbs */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-emerald-600/20" />
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-navy/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-blue-600/20" />
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:bg-teal-600/20" />

            <div className="relative w-full max-w-md z-10">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl glass shadow-lg shadow-navy/10 border border-white/20 dark:border-zinc-700/50 hover-lift">
                        <Image src="/mashaweer-logo.png" alt="Mashaweer" width={48} height={48} className="h-12 w-12 object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-navy dark:text-white drop-shadow-sm">
                        {sent ? t('forgot.success') : t('forgot.title')}
                    </h1>
                    <p className="mt-2 text-base text-zinc-700 dark:text-zinc-300">
                        {sent
                            ? 'We sent a password reset link to your email.'
                            : t('forgot.subtitle')}
                    </p>
                </div>

                {sent ? (
                    <div className="space-y-6 rounded-3xl glass-card border border-white/40 p-8 shadow-xl dark:border-zinc-800/50 backdrop-blur-xl">
                        <div className="flex flex-col items-center py-4">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            </div>
                            <p className="text-center text-zinc-700 dark:text-zinc-300 font-medium">
                                If an account exists with <strong className="text-navy dark:text-white font-bold">{email}</strong>,
                                you will receive an email with instructions.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="btn-3d flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg transition-all"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('forgot.backToLogin')}
                        </Link>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 rounded-3xl glass-card border border-white/40 p-8 shadow-xl dark:border-zinc-800/50 backdrop-blur-xl"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-navy dark:text-zinc-200">
                                Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-emerald-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
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
                                    {t('forgot.sending')}
                                </>
                            ) : (
                                t('forgot.send')
                            )}
                        </button>

                        <div className="pt-2 text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-navy dark:text-zinc-400 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t('forgot.backToLogin')}
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
