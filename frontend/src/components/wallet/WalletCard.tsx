'use client';

import React, { useRef, useState } from 'react';
import { useWalletStore } from '@/stores/useWalletStore';
import { api } from '@/lib/api';
import {
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    Upload,
    Smartphone,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
    Copy,
    Loader2,
} from 'lucide-react';

export function WalletCard() {
    const { balance, transactions, isLoading, requestDeposit, fetchWallet } =
        useWalletStore();
    const [showDeposit, setShowDeposit] = useState(false);
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<
        'INSTAPAY' | 'VODAFONE_CASH'
    >('INSTAPAY');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [receiptUrl, setReceiptUrl] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [paymentInfo, setPaymentInfo] = useState<{ instapayNumber: string; vodafoneCashNumber: string } | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    React.useEffect(() => {
        fetchWallet();
        api.getPaymentInfo()
            .then((res) => setPaymentInfo(res.data as any))
            .catch(() => {});
    }, [fetchWallet]);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setReceiptFile(file);
        setReceiptPreview(URL.createObjectURL(file));
        // Auto-upload
        try {
            setUploadingFile(true);
            const result = await api.uploadFile(file);
            setReceiptUrl(result.url);
        } catch {
            alert('Failed to upload receipt. Please try again.');
            setReceiptFile(null);
            setReceiptPreview(null);
        } finally {
            setUploadingFile(false);
        }
    };

    const handleDeposit = async () => {
        if (!amount || !receiptUrl) return;

        const success = await requestDeposit({
            amount: Number(amount),
            paymentMethod,
            receiptUrl,
        });
        if (success) {
            setShowDeposit(false);
            setAmount('');
            setReceiptUrl('');
            setReceiptFile(null);
            setReceiptPreview(null);
            fetchWallet();
        }
    };

    const getTransactionIcon = (type: string, reference?: string) => {
        if (reference?.startsWith('EARNING-')) {
            return <ArrowDownCircle className="h-3.5 w-3.5 text-emerald-500" />;
        }
        if (reference?.startsWith('COMMISSION-')) {
            return <ArrowUpCircle className="h-3.5 w-3.5 text-orange-500" />;
        }
        switch (type) {
            case 'DEPOSIT':
                return <ArrowDownCircle className="h-3.5 w-3.5 text-emerald-500" />;
            case 'PAYMENT':
                return <ArrowUpCircle className="h-3.5 w-3.5 text-red-500" />;
            case 'REFUND':
                return <ArrowDownCircle className="h-3.5 w-3.5 text-teal-500" />;
            default:
                return <CreditCard className="h-3.5 w-3.5 text-zinc-500" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
            case 'PENDING':
                return <Clock className="h-3 w-3 text-amber-500" />;
            case 'FAILED':
                return <XCircle className="h-3 w-3 text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-3">
            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-indigo-600 p-5 text-white shadow-xl">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
                <div className="relative">
                    <div className="flex items-center gap-1.5">
                        <Wallet className="h-4 w-4 opacity-80" />
                        <p className="text-xs font-medium opacity-80">Wallet Balance</p>
                    </div>
                    <p className="mt-1.5 text-3xl font-bold tracking-tight">
                        {Number(balance).toFixed(2)}
                        <span className="ml-1.5 text-base font-normal opacity-60">EGP</span>
                    </p>
                    <button
                        onClick={() => setShowDeposit(true)}
                        className="mt-3 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
                    >
                        + Add Funds
                    </button>
                </div>
            </div>

            {/* Payment Numbers Info */}
            {paymentInfo && (paymentInfo.instapayNumber || paymentInfo.vodafoneCashNumber) && (
                <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        💳 Payment Numbers
                    </h3>
                    <div className="space-y-1.5">
                        {paymentInfo.instapayNumber && (
                            <div className="flex items-center justify-between rounded-lg bg-teal-50 px-2.5 py-1.5 dark:bg-teal-900/20">
                                <div className="flex items-center gap-1.5">
                                    <CreditCard className="h-3 w-3 text-teal-600 dark:text-teal-400" />
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
                                    {copiedField === 'instapay' ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                </button>
                            </div>
                        )}
                        {paymentInfo.vodafoneCashNumber && (
                            <div className="flex items-center justify-between rounded-lg bg-red-50 px-2.5 py-1.5 dark:bg-red-900/20">
                                <div className="flex items-center gap-1.5">
                                    <Smartphone className="h-3 w-3 text-red-600 dark:text-red-400" />
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
                                    {copiedField === 'vodafone' ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Deposit Form */}
            {showDeposit && (
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Deposit Funds
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Amount (EGP)
                            </label>
                            <input
                                type="number"
                                min="10"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                                <button
                                    onClick={() => setPaymentMethod('INSTAPAY')}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-all ${paymentMethod === 'INSTAPAY'
                                        ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                                        : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'
                                        }`}
                                >
                                    <CreditCard className="h-3.5 w-3.5" />
                                    InstaPay
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('VODAFONE_CASH')}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-all ${paymentMethod === 'VODAFONE_CASH'
                                        ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                        : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'
                                        }`}
                                >
                                    <Smartphone className="h-3.5 w-3.5" />
                                    Vodafone Cash
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Receipt Screenshot
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-zinc-300 p-4 transition-colors hover:border-teal-400 hover:bg-teal-50/30 dark:border-zinc-700 dark:hover:border-teal-600"
                            >
                                {receiptPreview ? (
                                    <img
                                        src={receiptPreview}
                                        alt="Receipt"
                                        className="max-h-24 rounded-lg object-contain"
                                    />
                                ) : uploadingFile ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                                        <p className="text-xs text-teal-600">Uploading...</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-6 w-6 text-zinc-400" />
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Click to upload receipt
                                        </p>
                                        <p className="text-[10px] text-zinc-400">
                                            JPG, PNG, WebP up to 5MB
                                        </p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                            {receiptPreview && (
                                <button
                                    onClick={() => {
                                        setReceiptFile(null);
                                        setReceiptPreview(null);
                                        setReceiptUrl('');
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="mt-1 text-[10px] text-red-500 hover:text-red-600"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeposit(false)}
                                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeposit}
                                disabled={!amount || !receiptUrl || isLoading || uploadingFile}
                                className="flex-1 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:from-teal-600 hover:to-indigo-700 disabled:opacity-50"
                            >
                                {uploadingFile ? 'Uploading...' : isLoading ? 'Submitting...' : 'Submit Deposit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Recent Transactions
                </h3>

                {transactions.length === 0 ? (
                    <p className="py-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        No transactions yet
                    </p>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {transactions.map((tx) => {
                            const isEarning = tx.reference?.startsWith('EARNING-');
                            const isCommission = tx.reference?.startsWith('COMMISSION-');
                            const isPositive = tx.type === 'DEPOSIT' || tx.type === 'REFUND';
                            const label = isEarning
                                ? 'Trip Earning'
                                : isCommission
                                    ? 'Commission Payment'
                                    : tx.type.charAt(0) + tx.type.slice(1).toLowerCase();
                            return (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between py-2"
                            >
                                <div className="flex items-center gap-2">
                                    {getTransactionIcon(tx.type, tx.reference)}
                                    <div>
                                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                            {label}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={`text-xs font-semibold ${isPositive
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                            }`}
                                    >
                                        {isPositive ? '+' : '-'}
                                        {Number(tx.amount).toFixed(2)} EGP
                                    </span>
                                    {getStatusIcon(tx.status)}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
