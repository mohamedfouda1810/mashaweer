'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { WalletCard } from '@/components/wallet/WalletCard';
import { useAuthStore } from '@/stores/useAuthStore';
import { api, getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import {
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
    Smartphone,
    Copy,
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
    const [payScreenshotPreview, setPayScreenshotPreview] = useState<string | null>(null);
    const [payLoading, setPayLoading] = useState(false);
    const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState<{ instapayNumber: string; vodafoneCashNumber: string } | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

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
        api.getPaymentInfo()
            .then((res) => setPaymentInfo(res.data as any))
            .catch(() => {});
    }, [loadWalletData]);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        });
    };

    const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPayScreenshotPreview(URL.createObjectURL(file));
        setUploadingScreenshot(true);
        try {
            const res = await api.uploadFile(file);
            setPayScreenshot(res.url);
            toast.success('Screenshot uploaded');
        } catch {
            toast.error('Failed to upload screenshot');
            setPayScreenshotPreview(null);
        } finally {
            setUploadingScreenshot(false);
        }
    };

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
            setPayScreenshotPreview(null);
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
                <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center py-6 px-3 sm:py-10 sm:px-6">
                    <div className="w-full max-w-lg">
                        <h1 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">My Wallet</h1>
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
            <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center py-4 px-3 sm:py-8 sm:px-6">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="mb-5">
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
                            💰 Commission Wallet
                        </h1>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            Track commission debt and submit payments
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
                        </div>
                    ) : (
                        <>
                            {/* ─── Debt Summary Cards ─── */}
                            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                                <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-3 sm:p-4 shadow-sm dark:border-red-900/30 dark:from-red-900/20 dark:to-red-900/10">
                                    <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Remaining</span>
                                    </div>
                                    <p className="mt-1.5 text-xl sm:text-2xl font-bold text-red-700 dark:text-red-300">
                                        {debt?.remainingDebt?.toFixed(0) || 0}
                                        <span className="ml-0.5 text-[10px] sm:text-xs font-normal text-red-500">EGP</span>
                                    </p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-1.5 text-zinc-500">
                                        <DollarSign className="h-3.5 w-3.5 text-indigo-500" />
                                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Total Debt</span>
                                    </div>
                                    <p className="mt-1.5 text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                                        {debt?.totalDebt?.toFixed(0) || 0}
                                        <span className="ml-0.5 text-[10px] sm:text-xs font-normal text-zinc-500">EGP</span>
                                    </p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-1.5 text-zinc-500">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Paid</span>
                                    </div>
                                    <p className="mt-1.5 text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {debt?.totalPaid?.toFixed(0) || 0}
                                        <span className="ml-0.5 text-[10px] sm:text-xs font-normal text-zinc-500">EGP</span>
                                    </p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-center gap-1.5 text-zinc-500">
                                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Pending</span>
                                    </div>
                                    <p className="mt-1.5 text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">
                                        {debt?.totalPending?.toFixed(0) || 0}
                                        <span className="ml-0.5 text-[10px] sm:text-xs font-normal text-zinc-500">EGP</span>
                                    </p>
                                </div>
                            </div>

                            {/* ─── Pay Commission Button ─── */}
                            {(debt?.remainingDebt ?? 0) > 0 && (
                                <div className="mb-4">
                                    <button
                                        onClick={() => setShowPaymentForm((v) => !v)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:from-teal-500 hover:to-indigo-500 hover:shadow-lg active:scale-[0.98]"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        {showPaymentForm ? 'Cancel' : `Pay Commission (${debt?.remainingDebt?.toFixed(0)} EGP)`}
                                    </button>
                                </div>
                            )}

                            {/* ─── Payment Numbers Info ─── */}
                            {paymentInfo && (paymentInfo.instapayNumber || paymentInfo.vodafoneCashNumber) && (
                                <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-3 sm:p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        💳 Payment Accounts
                                    </h3>
                                    <div className="space-y-1.5">
                                        {paymentInfo.instapayNumber && (
                                            <div className="flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-900/20">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                                    <div>
                                                        <p className="text-[10px] font-medium text-teal-700 dark:text-teal-300">InstaPay</p>
                                                        <p className="font-mono text-xs font-semibold text-teal-900 dark:text-teal-100">
                                                            {paymentInfo.instapayNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(paymentInfo.instapayNumber, 'instapay')}
                                                    className="rounded-md p-1 text-teal-600 transition-colors hover:bg-teal-100 dark:text-teal-400"
                                                >
                                                    {copiedField === 'instapay' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                </button>
                                            </div>
                                        )}
                                        {paymentInfo.vodafoneCashNumber && (
                                            <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/20">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                                    <div>
                                                        <p className="text-[10px] font-medium text-red-700 dark:text-red-300">Vodafone Cash</p>
                                                        <p className="font-mono text-xs font-semibold text-red-900 dark:text-red-100">
                                                            {paymentInfo.vodafoneCashNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(paymentInfo.vodafoneCashNumber, 'vodafone')}
                                                    className="rounded-md p-1 text-red-600 transition-colors hover:bg-red-100 dark:text-red-400"
                                                >
                                                    {copiedField === 'vodafone' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ─── Payment Form ─── */}
                            {showPaymentForm && (
                                <div className="mb-4 rounded-xl border-2 border-teal-200 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-teal-800 dark:text-teal-300">
                                        <Send className="h-4 w-4" />
                                        Submit Payment
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                    Amount (EGP)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={payAmount}
                                                    onChange={(e) => setPayAmount(e.target.value)}
                                                    placeholder={`Max: ${debt?.remainingDebt?.toFixed(0)}`}
                                                    max={debt?.remainingDebt || 0}
                                                    min={1}
                                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                    Reference Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={payRef}
                                                    onChange={(e) => setPayRef(e.target.value)}
                                                    placeholder="IP-1234567890"
                                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Payment Screenshot
                                            </label>
                                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 bg-white px-3 py-2.5 text-sm transition-all hover:border-teal-400 hover:bg-teal-50/30 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-teal-600">
                                                {uploadingScreenshot ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                                                ) : (
                                                    <Upload className="h-4 w-4 text-zinc-400" />
                                                )}
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {uploadingScreenshot ? 'Uploading...' : payScreenshot ? '✅ Uploaded' : 'Upload screenshot'}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleScreenshotUpload}
                                                />
                                            </label>
                                            {payScreenshotPreview && (
                                                <img
                                                    src={payScreenshotPreview}
                                                    alt="Receipt"
                                                    className="mt-2 h-20 rounded-lg border object-cover"
                                                />
                                            )}
                                        </div>
                                        <button
                                            onClick={handleSubmitPayment}
                                            disabled={!payAmount || !payRef || !payScreenshot || payLoading}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50 active:scale-[0.98]"
                                        >
                                            {payLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                            {payLoading ? 'Submitting...' : 'Submit Payment'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ─── Tabs ─── */}
                            <div className="mb-4 flex gap-0.5 rounded-xl bg-zinc-100 p-0.5 dark:bg-zinc-800/60">
                                {(['overview', 'commissions', 'payments'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTab(t)}
                                        className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                                            tab === t
                                                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                                                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                                        }`}
                                    >
                                        {t === 'overview' ? '📊 Overview' : t === 'commissions' ? '📋 Commissions' : '💳 Payments'}
                                    </button>
                                ))}
                            </div>

                            {/* ─── Tab: Overview ─── */}
                            {tab === 'overview' && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Recent Commissions</h3>
                                    {commissions.length === 0 ? (
                                        <p className="rounded-xl bg-zinc-50 py-6 text-center text-xs text-zinc-500 dark:bg-zinc-800/50">
                                            No commissions yet. Complete trips to see them here.
                                        </p>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {commissions.slice(0, 5).map((c) => (
                                                <div
                                                    key={c.id}
                                                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${c.isPaid ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                            {c.isPaid ? <CheckCircle2 className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                                                                {c.trip?.fromCity} → {c.trip?.toCity}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-500">
                                                                {new Date(c.createdAt).toLocaleDateString()} • {(c.commissionRate * 100).toFixed(0)}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-red-600 dark:text-red-400">
                                                            {Number(c.amount).toFixed(0)} EGP
                                                        </p>
                                                        <span className={`text-[10px] font-medium ${c.isPaid ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {c.isPaid ? 'Paid' : 'Unpaid'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">Recent Payments</h3>
                                    {payments.length === 0 ? (
                                        <p className="rounded-xl bg-zinc-50 py-6 text-center text-xs text-zinc-500 dark:bg-zinc-800/50">
                                            No payments yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {payments.slice(0, 5).map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                            p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                                                            p.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                                            'bg-amber-100 text-amber-600'
                                                        } dark:bg-opacity-20`}>
                                                            {p.status === 'APPROVED' ? <CheckCircle2 className="h-4 w-4" /> :
                                                             p.status === 'REJECTED' ? <XCircle className="h-4 w-4" /> :
                                                             <Clock className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                                                                Ref: {p.instapayReferenceNumber}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-500">
                                                                {new Date(p.createdAt).toLocaleDateString()}
                                                                {p.adminNote && ` • ${p.adminNote}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-zinc-900 dark:text-white">
                                                            {Number(p.amount).toFixed(0)} EGP
                                                        </p>
                                                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
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
                                <div className="space-y-1.5">
                                    {commissions.length === 0 ? (
                                        <p className="rounded-xl bg-zinc-50 py-8 text-center text-xs text-zinc-500 dark:bg-zinc-800/50">
                                            No commissions recorded yet.
                                        </p>
                                    ) : (
                                        commissions.map((c) => (
                                            <div
                                                key={c.id}
                                                className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                                                            <MapPin className="mr-1 inline h-3 w-3 text-teal-500" />
                                                            {c.trip?.fromCity} → {c.trip?.toCity}
                                                        </p>
                                                        <p className="mt-0.5 text-[10px] text-zinc-500">
                                                            <Calendar className="mr-0.5 inline h-2.5 w-2.5" />
                                                            {c.trip?.departureTime ? new Date(c.trip.departureTime).toLocaleString() : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                                            {Number(c.amount).toFixed(0)} EGP
                                                        </p>
                                                        <p className="text-[10px] text-zinc-500">
                                                            Earned: {Number(c.tripEarnings).toFixed(0)} EGP
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-1.5 flex items-center justify-between border-t border-zinc-100 pt-1.5 dark:border-zinc-800">
                                                    <span className="text-[10px] text-zinc-500">
                                                        Rate: {(c.commissionRate * 100).toFixed(0)}%
                                                    </span>
                                                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${c.isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
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
                                <div className="space-y-1.5">
                                    {payments.length === 0 ? (
                                        <p className="rounded-xl bg-zinc-50 py-8 text-center text-xs text-zinc-500 dark:bg-zinc-800/50">
                                            No payment requests yet.
                                        </p>
                                    ) : (
                                        payments.map((p) => (
                                            <div
                                                key={p.id}
                                                className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                                                            <Receipt className="mr-1 inline h-3 w-3 text-indigo-500" />
                                                            Payment: {Number(p.amount).toFixed(0)} EGP
                                                        </p>
                                                        <p className="mt-0.5 text-[10px] text-zinc-500">
                                                            Ref: {p.instapayReferenceNumber}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-500">
                                                            {new Date(p.createdAt).toLocaleString()}
                                                        </p>
                                                        {p.adminNote && (
                                                            <p className="mt-0.5 text-[10px] text-red-500">
                                                                Note: {p.adminNote}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                        p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        p.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                                {p.screenshotUrl && (
                                                    <div className="mt-2">
                                                        <a href={getImageUrl(p.screenshotUrl) || p.screenshotUrl} target="_blank" rel="noreferrer">
                                                            <img
                                                                src={getImageUrl(p.screenshotUrl) || p.screenshotUrl}
                                                                alt="Receipt"
                                                                className="h-16 rounded-lg border object-cover hover:opacity-80"
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
