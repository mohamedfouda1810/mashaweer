'use client';

import React, { useRef, useState } from 'react';
import { useWalletStore } from '@/stores/useWalletStore';
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
} from 'lucide-react';

export function WalletCard() {
    const { balance, transactions, isLoading, requestDeposit, fetchWallet } =
        useWalletStore();
    const [showDeposit, setShowDeposit] = useState(false);
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<
        'INSTAPAY' | 'VODAFONE_CASH'
    >('INSTAPAY');
    const [receiptUrl, setReceiptUrl] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setReceiptFile(file);
        setReceiptPreview(URL.createObjectURL(file));
    };

    const handleDeposit = async () => {
        if (!amount || (!receiptUrl && !receiptFile)) return;

        let finalReceiptUrl = receiptUrl;

        // Upload file first if one was selected
        if (receiptFile && !receiptUrl) {
            try {
                setUploadingFile(true);
                const { api } = await import('@/lib/api');
                const result = await api.uploadFile(receiptFile);
                finalReceiptUrl = result.url;
            } catch {
                alert('Failed to upload receipt. Please try again.');
                setUploadingFile(false);
                return;
            } finally {
                setUploadingFile(false);
            }
        }

        if (!finalReceiptUrl) return;

        const success = await requestDeposit({
            amount: Number(amount),
            paymentMethod,
            receiptUrl: finalReceiptUrl,
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

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'DEPOSIT':
                return <ArrowDownCircle className="h-4 w-4 text-emerald-500" />;
            case 'PAYMENT':
                return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
            case 'REFUND':
                return <ArrowDownCircle className="h-4 w-4 text-amber-500" />;
            default:
                return <CreditCard className="h-4 w-4 text-zinc-500" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
            case 'PENDING':
                return <Clock className="h-3.5 w-3.5 text-amber-500" />;
            case 'FAILED':
                return <XCircle className="h-3.5 w-3.5 text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-700 p-6 text-white shadow-xl">
                <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
                <div className="relative">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 opacity-80" />
                        <p className="text-sm font-medium opacity-80">Wallet Balance</p>
                    </div>
                    <p className="mt-2 text-4xl font-bold tracking-tight">
                        {Number(balance).toFixed(2)}
                        <span className="ml-2 text-lg font-normal opacity-60">EGP</span>
                    </p>
                    <button
                        onClick={() => setShowDeposit(true)}
                        className="mt-4 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
                    >
                        + Add Funds
                    </button>
                </div>
            </div>

            {/* Deposit Form */}
            {showDeposit && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Deposit Funds
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Amount (EGP)
                            </label>
                            <input
                                type="number"
                                min="10"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setPaymentMethod('INSTAPAY')}
                                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${paymentMethod === 'INSTAPAY'
                                        ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                        : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'
                                        }`}
                                >
                                    <CreditCard className="h-4 w-4" />
                                    InstaPay
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('VODAFONE_CASH')}
                                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${paymentMethod === 'VODAFONE_CASH'
                                        ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                        : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'
                                        }`}
                                >
                                    <Smartphone className="h-4 w-4" />
                                    Vodafone Cash
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Receipt Screenshot
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 p-6 transition-colors hover:border-amber-400 hover:bg-amber-50/30 dark:border-zinc-700 dark:hover:border-amber-600 dark:hover:bg-amber-900/10"
                            >
                                {receiptPreview ? (
                                    <img
                                        src={receiptPreview}
                                        alt="Receipt"
                                        className="max-h-32 rounded-lg object-contain"
                                    />
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-zinc-400" />
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Click to upload receipt
                                        </p>
                                        <p className="text-xs text-zinc-400">
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
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="mt-1 text-xs text-red-500 hover:text-red-600"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeposit(false)}
                                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeposit}
                                disabled={!amount || (!receiptUrl && !receiptFile) || isLoading || uploadingFile}
                                className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
                            >
                                {uploadingFile ? 'Uploading...' : isLoading ? 'Submitting...' : 'Submit Deposit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Recent Transactions
                </h3>

                {transactions.length === 0 ? (
                    <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        No transactions yet
                    </p>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between py-3"
                            >
                                <div className="flex items-center gap-3">
                                    {getTransactionIcon(tx.type)}
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                            {tx.type.charAt(0) + tx.type.slice(1).toLowerCase()}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-sm font-semibold ${tx.type === 'DEPOSIT' || tx.type === 'REFUND'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                            }`}
                                    >
                                        {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}
                                        {Number(tx.amount).toFixed(2)} EGP
                                    </span>
                                    {getStatusIcon(tx.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
