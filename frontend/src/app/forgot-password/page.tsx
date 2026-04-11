'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.forgotPassword(email);
            setSent(true);
            toast.success('Check your email for the reset link!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-navy/10 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                        <Image src="/mashaweer-logo.png" alt="Mashaweer" width={40} height={40} className="h-10 w-10 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {sent ? 'Check your email' : 'Forgot password?'}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {sent
                            ? 'We sent a password reset link to your email.'
                            : 'Enter your email and we\'ll send you a reset link.'}
                    </p>
                </div>

                {sent ? (
                    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex flex-col items-center py-4">
                            <CheckCircle2 className="h-16 w-16 text-mint mb-4" />
                            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                                If an account exists with <strong className="text-zinc-900 dark:text-white">{email}</strong>,
                                you will receive an email with instructions to reset your password.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-mint py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 transition-colors focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-mint py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-navy-light hover:to-mint-light hover:shadow-md active:scale-[0.98] disabled:opacity-60"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>

                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Login
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
}
