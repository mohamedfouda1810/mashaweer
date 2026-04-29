'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  X,
  CheckCircle2,
  Wallet,
  Banknote,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface BookingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: 'WALLET' | 'CASH') => void;
  tripFromCity: string;
  tripToCity: string;
  pricePerSeat: number;
  seats: number;
  isBooking: boolean;
}

export function BookingRulesModal({
  isOpen,
  onClose,
  onConfirm,
  tripFromCity,
  tripToCity,
  pricePerSeat,
  seats,
  isBooking,
}: BookingRulesModalProps) {
  const [step, setStep] = useState<'rules' | 'payment'>('rules');
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CASH'>('CASH');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const totalPrice = Math.round(pricePerSeat * seats * 100) / 100;

  useEffect(() => {
    if (isOpen && step === 'payment') {
      setLoadingBalance(true);
      api.getBalance()
        .then((res) => setWalletBalance(res.data?.balance ?? 0))
        .catch(() => setWalletBalance(0))
        .finally(() => setLoadingBalance(false));
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) {
      setStep('rules');
      setPaymentMethod('CASH');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const insufficientBalance = walletBalance !== null && walletBalance < totalPrice;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {step === 'rules' ? 'شروط الحجز' : 'طريقة الدفع'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {step === 'rules' ? (
            <div className="space-y-4" dir="rtl">
              {/* Trip Summary */}
              <div className="rounded-xl bg-gradient-to-r from-teal-50 to-indigo-50 p-3 dark:from-teal-900/20 dark:to-indigo-900/20">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  {tripFromCity} ← {tripToCity}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {seats} مقعد • {totalPrice} جنيه مصري
                </p>
              </div>

              {/* Rules */}
              <div className="space-y-3">
                <div className="flex gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                    ١
                  </span>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    الالتزام بالحضور في نقطة التجمع قبل موعد الرحلة بوقت كافٍ. التأخير قد يؤدي لإلغاء الحجز.
                  </p>
                </div>

                <div className="flex gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                    ٢
                  </span>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    لا يمكن إلغاء الحجز قبل موعد الرحلة بأقل من ٨ ساعات. يُرجى التأكد من جديّة الحجز.
                  </p>
                </div>

                <div className="flex gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                    ٣
                  </span>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    الركاب ملزمون بالتعامل باحترام مع السائق والركاب الآخرين طوال الرحلة.
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                  <strong>تنبيه هام:</strong> في حالة عدم الحضور (No-Show) بدون إلغاء مسبق، قد يتم تقييد حسابك من الحجز مستقبلاً.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Price Summary */}
              <div className="rounded-xl bg-gradient-to-r from-teal-50 to-indigo-50 p-4 dark:from-teal-900/20 dark:to-indigo-900/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Price</span>
                  <span className="text-xl font-bold text-zinc-900 dark:text-white">{totalPrice} EGP</span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {seats} seat(s) × {pricePerSeat} EGP/seat
                </p>
              </div>

              {/* Payment Options */}
              <div className="space-y-2">
                {/* Wallet Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('WALLET')}
                  disabled={insufficientBalance}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 transition-all ${
                    paymentMethod === 'WALLET'
                      ? 'border-teal-500 bg-teal-50 shadow-sm dark:border-teal-600 dark:bg-teal-900/20'
                      : insufficientBalance
                        ? 'cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-50 dark:border-zinc-800 dark:bg-zinc-900'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    paymentMethod === 'WALLET' ? 'bg-teal-100 dark:bg-teal-900/30' : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}>
                    <Wallet className={`h-5 w-5 ${paymentMethod === 'WALLET' ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-500'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">المحفظة (Wallet)</p>
                    <p className="text-xs text-zinc-500">
                      {loadingBalance ? (
                        <span className="animate-pulse">Loading balance...</span>
                      ) : walletBalance !== null ? (
                        <>
                          الرصيد المتاح: <strong className={insufficientBalance ? 'text-red-500' : 'text-emerald-600'}>{walletBalance} جنيه</strong>
                          {insufficientBalance && <span className="text-red-500 ml-1">(غير كافٍ)</span>}
                        </>
                      ) : (
                        'الدفع من رصيد المحفظة'
                      )}
                    </p>
                  </div>
                  {paymentMethod === 'WALLET' && !insufficientBalance && (
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                  )}
                </button>

                {/* Cash Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-teal-500 bg-teal-50 shadow-sm dark:border-teal-600 dark:bg-teal-900/20'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    paymentMethod === 'CASH' ? 'bg-teal-100 dark:bg-teal-900/30' : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}>
                    <Banknote className={`h-5 w-5 ${paymentMethod === 'CASH' ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-500'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">كاش (Cash)</p>
                    <p className="text-xs text-zinc-500">الدفع للسائق عند الرحلة</p>
                  </div>
                  {paymentMethod === 'CASH' && (
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                  )}
                </button>
              </div>

              {/* 8-hour notice */}
              <div className="flex items-start gap-2 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  يمكنك إلغاء الحجز حتى ٨ ساعات قبل موعد الرحلة فقط.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <button
            onClick={step === 'payment' ? () => setStep('rules') : onClose}
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {step === 'payment' ? 'رجوع' : 'إلغاء'}
          </button>
          <button
            onClick={() => {
              if (step === 'rules') {
                setStep('payment');
              } else {
                onConfirm(paymentMethod);
              }
            }}
            disabled={isBooking || (step === 'payment' && paymentMethod === 'WALLET' && insufficientBalance)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:from-teal-500 hover:to-indigo-500 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {isBooking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحجز...
              </>
            ) : step === 'rules' ? (
              'أوافق على الشروط ✓'
            ) : (
              'تأكيد الحجز ✓'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
