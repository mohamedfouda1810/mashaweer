'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { WalletCard } from '@/components/wallet/WalletCard';
import { useAuthStore } from '@/stores/useAuthStore';
import { api, getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    Upload,
    Send,
    MapPin,
    Calendar,
    Loader2,
    Receipt,
    AlertTriangle,
    CreditCard,
} from 'lucide-react';

interface DebtSummary {
    totalDebt: number;
    totalPaid: number;
    totalPending: number;
    remainingDebt: number;
}

interface Commission {
    id: string;
    tripId: string;
    tripEarnings: string;
    commissionRate: number;
    amount: string;
    isPaid: boolean;
    createdAt: string;
    trip?: {
        id: string;
        fromCity: string;
        toCity: string;
        departureTime: string;
        price: string;
        totalSeats: number;
    };
}

interface CommissionPayment {
    id: string;
    amount: string;
    instapayReferenceNumber: string;
    screenshotUrl: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminNote?: string;
    createdAt: string;
}

interface DriverWalletData {
    debtSummary: DebtSummary;
    commissions: Commission[];
    payments: CommissionPayment[];
}

export default function WalletPage() {
    const { user } = useAuthStore();
    const [walletData, setWalletData] = useState<DriverWalletData | null>(null);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<'overview' | 'commissions' | 'payments'>('overview');

    // Payment form state
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [payRef, setPayRef] = useState('');
    const [payScreenshot, setPayScreenshot] = useState('');
    const [payLoading, setPayLoading] = useState(false);

    const loadWalletData = useCallback(async () => {
        if (user?.role !== 'DRIVER') return;
        setLoading(true);
        try {
            const res = await api.getDriverWallet();
            setWalletData(res.data as unknown as DriverWalletData);
        } catch {
            // wallet might not exist yet, that's ok
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadWalletData();
    }, [loadWalletData]);

    const handleSubmitPayment = async () => {
        if (!payAmount || !payRef || !payScreenshot) {
            toast.error('Please fill all fields and upload a screenshot');
            return;
        }
        setPayLoading(true);
        try {
            await api.submitCommissionPayment({
                amount: Number(payAmount),
                instapayReferenceNumber: payRef,
                screenshotUrl: payScreenshot,
            });
            toast.success('Payment request submitted! Admin will review it.');
            setShowPaymentForm(false);
            setPayAmount('');
            setPayRef('');
            setPayScreenshot('');
            loadWalletData();
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit payment');
        } finally {
            setPayLoading(false);
        }
    };

    // For non-driver users, just show WalletCard
    if (user?.role !== 'DRIVER') {
        return (
            <ProtectedRoute>
                <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center py-8 px-4 sm:py-12 sm:px-6">
                    <div className="w-full max-w-2xl">
                        <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">My Wallet</h1>
                        <WalletCard />
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const debt = walletData?.debtSummary;
    const commissions = walletData?.commissions || [];
    const payments = walletData?.payments || [];

    return (
        <ProtectedRoute>
            <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center py-8 px-4 sm:py-12 sm:px-6">
                <div className="w-full max-w-3xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                            💰 Driver Commission Wallet
                        </h1>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            Track your commission debt and submit payments.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                        </div>
                    ) : (
                        <>
                            {/* ─── Debt Summary Cards ─── */}
                            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-5 shadow-sm dark:border-red-900/30 dark:from-red-900/20 dark:to-red-900/10">
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Remaining Debt</span>
                                    </div>
                                    <p className="mt-2 text-3xl font-bold text-red-700 dark:text-red-300">
                                        {debt?.remainingDebt?.toFixed(0) || 0}
                                        <span className="ml-1 text-sm font-normal text-red-500 dark:text-red-400">EGP</span>
                                    </p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <DollarSign className="h-4 w-4 text-indigo-500" />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Total Debt</span>
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                                        {debt?.totalDebt?.toFixed(0) || 0}
                                        <span className="ml-1 text-sm font-normal text-zinc-500">EGP</span>
                                    </p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Total Paid</span>
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {debt?.totalPaid?.toFixed(0) || 0}
                                        <span className="ml-1 text-sm font-normal text-zinc-500">EGP</span>
                                    </p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <Clock className="h-4 w-4 text-amber-500" />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Pending</span>
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                                        {debt?.totalPending?.toFixed(0) || 0}
                                        <span className="ml-1 text-sm font-normal text-zinc-500">EGP</span>
                                    </p>
                                </div>
                            </div>

                            {/* ─── Pay Commission Button ─── */}
                            {(debt?.remainingDebt ?? 0) > 0 && (
                                <div className="mb-6">
                                    <button
                                        onClick={() => setShowPaymentForm((v) => !v)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:from-teal-500 hover:to-indigo-500 hover:shadow-xl"
                                    >
                                        <CreditCard className="h-5 w-5" />
                                        {showPaymentForm ? 'Cancel Payment' : `Pay Commission (${debt?.remainingDebt?.toFixed(0)} EGP)`}
                                    </button>
                                </div>
                            )}

                            {/* ─── Payment Form ─── */}
                            {showPaymentForm && (
                                <div className="mb-6 rounded-xl border-2 border-teal-200 bg-teal-50/50 p-6 dark:border-teal-800 dark:bg-teal-900/20">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-teal-800 dark:text-teal-300">
                                        <Send className="h-5 w-5" />
                                        Submit InstaPay Payment
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Amount (EGP)
                                            </label>
                                            <input
                                                type="number"
                                                value={payAmount}
                                                onChange={(e) => setPayAmount(e.target.value)}
                                                placeholder={`Max: ${debt?.remainingDebt?.toFixed(0)} EGP`}
                                                max={debt?.remainingDebt || 0}
                                                min={1}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                InstaPay Reference Number
                                            </label>
                                            <input
                                                type="text"
                                                value={payRef}
                                                onChange={(e) => setPayRef(e.target.value)}
                                                placeholder="e.g., IP-1234567890"
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Payment Screenshot
                                            </label>
                                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-zinc-300 bg-white px-4 py-3 text-sm transition-all hover:border-teal-400 hover:bg-teal-50/30 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-teal-600">
                                                <Upload className="h-5 w-5 text-zinc-400" />
                                                <span className="text-zinc-500 dark:text-zinc-400">
                                                    {payScreenshot ? '✅ Screenshot uploaded' : 'Click to upload screenshot'}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            try {
                                                                const res = await api.uploadFile(file);
                                                                setPayScreenshot(res.url);
                                                                toast.success('Screenshot uploaded');
                                                            } catch {
                                                                toast.error('Failed to upload');
                                                            }
                                                        }
                                                    }}
                                                />
                                            </label>
                                            {payScreenshot && (
                                                <img
                                                    src={getImageUrl(payScreenshot) || payScreenshot}
                                                    alt="Receipt"
                                                    className="mt-2 h-32 rounded-lg border object-cover"
                                                />
                                            )}
                                        </div>
                                        <button
                                            onClick={handleSubmitPayment}
                                            disabled={!payAmount || !payRef || !payScreenshot || payLoading}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                                        >
                                            {payLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
                                            {payLoading ? 'Submitting...' : 'Submit Payment for Review'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ─── Tabs ─── */}
                            <div className="mb-6 flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/60">
                                {(['overview', 'commissions', 'payments'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTab(t)}
                                        className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                                            tab === t
                                                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                                                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                        }`}
                                    >
                                        {t === 'overview' ? '📊 Overview' : t === 'commissions' ? '📋 Commissions' : '💳 Payments'}
                                    </button>
                                ))}
                            </div>

                            {/* ─── Tab: Overview ─── */}
                            {tab === 'overview' && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-zinc-900 dark:text-white">Recent Commissions</h3>
                                    {commissions.length === 0 ? (
                                        <p className="rounded-xl bg-zinc-50 py-8 text-center text-sm text-zinc-500 dark:bg-zinc-800/50">
                                            No commissions yet. Complete trips to see them here.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {commissions.slice(0, 5).map((c) => (
                                                <div
                                                    key={c.id}
                                                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${c.isPaid ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                            {c.isPaid ? <CheckCircle2 className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                                {c.trip?.fromCity} → {c.trip?.toCity}
                                                            </p>
                                                            <p className="text-xs text-zinc-500">
                                                                {new Date(c.createdAt).toLocaleDateString()} • {(c.commissionRate * 100).toFixed(0)}% rate
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                                            {Number(c.amount).toFixed(0)} EGP
                                                        </p>
                                                        <span className={`text-xs font-medium ${c.isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                                            {c.isPaid ? 'Paid' : 'Unpaid'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <h3 className="mt-6 font-semibold text-zinc-900 dark:text-white">Recent Payments</h3>
                                    {payments.length === 0 ? (
                                        <p className="rounded-xl bg-zinc-50 py-8 text-center text-sm text-zinc-500 dark:bg-zinc-800/50">
                                            No payments yet. Submit a payment to clear your debt.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {payments.slice(0, 5).map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                            p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                                                            p.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                                            'bg-amber-100 text-amber-600'
                                                        } dark:bg-opacity-20`}>
                                                            {p.status === 'APPROVED' ? <CheckCircle2 className="h-5 w-5" /> :
                                                             p.status === 'REJECTED' ? <XCircle className="h-5 w-5" /> :
                                                             <Clock className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                                InstaPay: {p.instapayReferenceNumber}
                                                            </p>
                                                            <p className="text-xs text-zinc-500">
                                                                {new Date(p.createdAt).toLocaleDateString()}
                                                                {p.adminNote && ` • ${p.adminNote}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                                            {Number(p.amount).toFixed(0)} EGP
                                                        </p>
                                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                            p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            p.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }`}>
                                                            {p.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ─── Tab: All Commissions ─── */}
                            {tab === 'commissions' && (
                                <div className="space-y-2">
                                    {commissions.length === 0 ? (
                                        <p className="rounded-xl bg-zinc-50 py-12 text-center text-sm text-zinc-500 dark:bg-zinc-800/50">
                                            No commissions recorded yet.
                                        </p>
                                    ) : (
                                        commissions.map((c) => (
                                            <div
                                                key={c.id}
                                                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-zinc-900 dark:text-white">
                                                            <MapPin className="mr-1 inline h-4 w-4 text-teal-500" />
                                                            {c.trip?.fromCity} → {c.trip?.toCity}
                                                        </p>
                                                        <p className="mt-1 text-xs text-zinc-500">
                                                            <Calendar className="mr-1 inline h-3 w-3" />
                                                            {c.trip?.departureTime ? new Date(c.trip.departureTime).toLocaleString() : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                                            {Number(c.amount).toFixed(0)} EGP
                                                        </p>
                                                        <p className="text-xs text-zinc-500">
                                                            Earnings: {Number(c.tripEarnings).toFixed(0)} EGP
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800">
                                                    <span className="text-xs text-zinc-500">
                                                        Rate: {(c.commissionRate * 100).toFixed(0)}%
                                                    </span>
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {c.isPaid ? '✅ Paid' : '❌ Unpaid'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* ─── Tab: Payment History ─── */}
                            {tab === 'payments' && (
                                <div className="space-y-3">
                                    {payments.length === 0 ? (
                                        <p className="rounded-xl bg-zinc-50 py-12 text-center text-sm text-zinc-500 dark:bg-zinc-800/50">
                                            No payment requests yet.
                                        </p>
                                    ) : (
                                        payments.map((p) => (
                                            <div
                                                key={p.id}
                                                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-semibold text-zinc-900 dark:text-white">
                                                            <Receipt className="mr-1 inline h-4 w-4 text-indigo-500" />
                                                            Payment: {Number(p.amount).toFixed(0)} EGP
                                                        </p>
                                                        <p className="mt-1 text-xs text-zinc-500">
                                                            Ref: {p.instapayReferenceNumber}
                                                        </p>
                                                        <p className="text-xs text-zinc-500">
                                                            {new Date(p.createdAt).toLocaleString()}
                                                        </p>
                                                        {p.adminNote && (
                                                            <p className="mt-1 text-xs text-red-500">
                                                                Admin note: {p.adminNote}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                        p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        p.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                                {p.screenshotUrl && (
                                                    <div className="mt-3">
                                                        <a href={getImageUrl(p.screenshotUrl) || p.screenshotUrl} target="_blank" rel="noreferrer">
                                                            <img
                                                                src={getImageUrl(p.screenshotUrl) || p.screenshotUrl}
                                                                alt="Receipt"
                                                                className="h-20 rounded-lg border object-cover hover:opacity-80"
                                                            />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
