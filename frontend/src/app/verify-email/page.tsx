'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [resendEmail, setResendEmail] = useState('');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        api.verifyEmail(token)
            .then((res) => {
                setStatus('success');
                setMessage(res.data?.message || 'Email verified successfully!');
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.message || 'Verification failed. The link may have expired.');
            });
    }, [token]);

    const handleResend = async () => {
        if (!resendEmail) return;
        setResending(true);
        try {
            await api.resendVerification(resendEmail);
            setMessage('Verification email sent! Check your inbox.');
        } catch {
            // silent
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
            <div className="w-full max-w-md text-center">
                <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-navy/10 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                    <Image src="/mashaweer-logo.png" alt="Mashaweer" width={40} height={40} className="h-10 w-10 object-contain" />
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-mint mb-4" />
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Verifying your email...</h2>
                            <p className="mt-2 text-sm text-zinc-500">Please wait a moment.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle2 className="mx-auto h-16 w-16 text-mint mb-4" />
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Email Verified! ✅</h2>
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
                            <Link
                                href="/login"
                                className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-navy to-mint py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
                            >
                                Sign In Now
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Verification Failed</h2>
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
                            
                            <div className="mt-6 space-y-3">
                                <p className="text-xs text-zinc-500">Need a new verification link?</p>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <input
                                            type="email"
                                            value={resendEmail}
                                            onChange={(e) => setResendEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full rounded-lg border border-zinc-300 py-2 pl-10 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                        />
                                    </div>
                                    <button
                                        onClick={handleResend}
                                        disabled={resending || !resendEmail}
                                        className="rounded-lg bg-mint px-4 py-2 text-sm font-medium text-white hover:bg-mint-light disabled:opacity-50"
                                    >
                                        {resending ? '...' : 'Resend'}
                                    </button>
                                </div>
                            </div>

                            <Link
                                href="/login"
                                className="mt-4 inline-block text-sm text-mint hover:underline"
                            >
                                Go to Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-mint" /></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
