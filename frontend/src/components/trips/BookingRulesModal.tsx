'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  QrCode,
} from 'lucide-react';
import { QRCodeDisplay } from '@/components/passenger/QRCodeDisplay';
import { useTranslation } from '@/hooks/useTranslation';

interface BookingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: 'WALLET' | 'CASH') => void;
  tripFromCity: string;
  tripToCity: string;
  pricePerSeat: number;
  seats: number;
  isBooking: boolean;
  /** Passed after booking succeeds — triggers the QR step */
  bookingResult?: {
    bookingId: string;
    tripId: string;
    boardingToken: string;
  } | null;
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
  bookingResult,
}: BookingRulesModalProps) {
  const { t, locale } = useTranslation();
  const [step, setStep] = useState<'rules' | 'payment'>('rules');
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CASH'>('CASH');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const totalPrice = Math.round(pricePerSeat * seats * 100) / 100;

  // Derived effective step: if bookingResult is present, we show the QR screen
  const effectiveStep: 'rules' | 'payment' | 'qr' = bookingResult ? 'qr' : step;

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const res = await api.getBalance();
      setWalletBalance(res.data?.balance ?? 0);
    } catch {
      setWalletBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    setStep('rules');
    setPaymentMethod('CASH');
    onClose();
  }, [onClose]);

  const handleProceedToPayment = () => {
    setStep('payment');
    fetchBalance();
  };

  const handleBackToRules = () => {
    setStep('rules');
  };

  if (!isOpen) return null;

  const insufficientBalance = walletBalance !== null && walletBalance < totalPrice;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/40 backdrop-blur-md p-4 transition-all duration-300"
      onClick={handleClose}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-navy-950/70"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/5">
          <div className="flex items-center gap-2">
            {effectiveStep === 'qr' ? (
              <QrCode className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-navy-600 dark:text-navy-400" />
            )}
            <h2 className="text-lg font-bold text-navy-900 dark:text-white">
              {effectiveStep === 'rules'
                ? t('booking.rules.title')
                : effectiveStep === 'payment'
                  ? t('booking.payment.title')
                  : t('booking.qr.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-navy-400 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">
          {effectiveStep === 'qr' && bookingResult ? (
            <div className="space-y-4 text-center">
              <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 p-3 dark:from-emerald-900/20 dark:to-emerald-800/20">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <p className="mt-2 font-bold text-navy-900 dark:text-white">{t('booking.success')}</p>
                <p className="text-sm text-navy-600 dark:text-navy-300">
                  {tripFromCity} ← {tripToCity}
                </p>
              </div>
              <p className="text-sm text-navy-600 dark:text-navy-300">
                {t('booking.success.keepQR')}
              </p>
              <div className="flex justify-center">
                <QRCodeDisplay
                  bookingId={bookingResult.bookingId}
                  tripId={bookingResult.tripId}
                  boardingToken={bookingResult.boardingToken}
                />
              </div>
            </div>
          ) : effectiveStep === 'rules' ? (
            <div className="space-y-4">
              {/* Trip Summary */}
              <div className="rounded-xl bg-gradient-to-r from-navy-50 to-emerald-50 p-3 dark:from-navy-900/20 dark:to-emerald-900/20">
                <p className="text-sm font-bold text-navy-900 dark:text-white">
                  {tripFromCity} ← {tripToCity}
                </p>
                <p className="mt-0.5 text-xs text-navy-600 dark:text-navy-300">
                  {seats} {t('booking.payment.totalPrice')} • {totalPrice} {t('common.egp')}
                </p>
              </div>

              {/* Rules */}
              <div className="space-y-3">
                <div className="flex gap-3 rounded-xl bg-white/50 p-3 dark:bg-black/20">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-100 text-sm font-bold text-navy-700 dark:bg-navy-900/50 dark:text-navy-300">
                    1
                  </span>
                  <p className="text-sm leading-relaxed text-navy-700 dark:text-navy-300">
                    {t('booking.rules.rule1')}
                  </p>
                </div>

                <div className="flex gap-3 rounded-xl bg-white/50 p-3 dark:bg-black/20">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-100 text-sm font-bold text-navy-700 dark:bg-navy-900/50 dark:text-navy-300">
                    2
                  </span>
                  <p className="text-sm leading-relaxed text-navy-700 dark:text-navy-300">
                    {t('booking.rules.rule2')}
                  </p>
                </div>

                <div className="flex gap-3 rounded-xl bg-white/50 p-3 dark:bg-black/20">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-100 text-sm font-bold text-navy-700 dark:bg-navy-900/50 dark:text-navy-300">
                    3
                  </span>
                  <p className="text-sm leading-relaxed text-navy-700 dark:text-navy-300">
                    {t('booking.rules.rule3')}
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 rounded-xl bg-amber-50/50 p-3 dark:bg-amber-900/20">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                  <strong>{t('booking.rules.warning')}</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Price Summary */}
              <div className="rounded-xl bg-gradient-to-r from-navy-50 to-emerald-50 p-4 dark:from-navy-900/20 dark:to-emerald-900/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-navy-600 dark:text-navy-300">{t('booking.payment.totalPrice')}</span>
                  <span className="text-xl font-bold text-navy-900 dark:text-white">{totalPrice} {t('common.egp')}</span>
                </div>
                <p className="mt-0.5 text-xs text-navy-500">
                  {seats} × {pricePerSeat} {t('common.egp')}
                </p>
              </div>

              {/* Payment Options */}
              <div className="space-y-2">
                {/* Wallet Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('WALLET')}
                  disabled={insufficientBalance}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3.5 transition-all ${
                    paymentMethod === 'WALLET'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm dark:border-emerald-600 dark:bg-emerald-900/20'
                      : insufficientBalance
                        ? 'cursor-not-allowed border-black/5 bg-black/5 opacity-50 dark:border-white/5 dark:bg-white/5'
                        : 'border-black/10 bg-white/50 hover:border-black/20 dark:border-white/10 dark:bg-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      paymentMethod === 'WALLET' ? 'bg-emerald-100/50 dark:bg-emerald-900/30' : 'bg-black/5 dark:bg-white/5'
                    }`}
                  >
                    <Wallet className={`h-5 w-5 ${paymentMethod === 'WALLET' ? 'text-emerald-600 dark:text-emerald-400' : 'text-navy-500'}`} />
                  </div>
                  <div className="flex-1 text-left rtl:text-right">
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{t('booking.payment.wallet')}</p>
                    <p className="text-xs text-navy-500">
                      {loadingBalance ? (
                        <span className="animate-pulse">...</span>
                      ) : walletBalance !== null ? (
                        <>
                          {t('booking.payment.walletBalance')}:{' '}
                          <strong className={insufficientBalance ? 'text-red-500' : 'text-emerald-600'}>
                            {walletBalance} {t('common.egp')}
                          </strong>
                          {insufficientBalance && <span className="mx-1 text-red-500">({t('booking.payment.insufficient')})</span>}
                        </>
                      ) : (
                        t('booking.payment.walletDesc')
                      )}
                    </p>
                  </div>
                  {paymentMethod === 'WALLET' && !insufficientBalance && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                </button>

                {/* Cash Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3.5 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm dark:border-emerald-600 dark:bg-emerald-900/20'
                      : 'border-black/10 bg-white/50 hover:border-black/20 dark:border-white/10 dark:bg-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      paymentMethod === 'CASH' ? 'bg-emerald-100/50 dark:bg-emerald-900/30' : 'bg-black/5 dark:bg-white/5'
                    }`}
                  >
                    <Banknote className={`h-5 w-5 ${paymentMethod === 'CASH' ? 'text-emerald-600 dark:text-emerald-400' : 'text-navy-500'}`} />
                  </div>
                  <div className="flex-1 text-left rtl:text-right">
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{t('booking.payment.cash')}</p>
                    <p className="text-xs text-navy-500">{t('booking.payment.cashDesc')}</p>
                  </div>
                  {paymentMethod === 'CASH' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                </button>
              </div>

              {/* 8-hour notice */}
              <div className="flex items-start gap-2 rounded-lg bg-black/5 p-2.5 dark:bg-white/5">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-500" />
                <p className="text-[11px] text-navy-600 dark:text-navy-400">
                  {t('booking.payment.cancelNotice')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Pinned at bottom */}
        <div className="flex shrink-0 gap-2 border-t border-black/5 px-5 py-4 dark:border-white/5">
          {effectiveStep === 'qr' ? (
            <button
              type="button"
              onClick={handleClose}
              className="btn-3d flex-1 rounded-xl bg-gradient-to-r from-navy to-emerald px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90"
            >
              {t('common.close')}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={effectiveStep === 'payment' ? handleBackToRules : handleClose}
                className="flex-1 rounded-xl border border-black/10 bg-white/50 px-4 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-black/20 dark:text-white dark:hover:bg-white/5"
              >
                {effectiveStep === 'payment' ? t('common.back') : t('common.close')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (effectiveStep === 'rules') {
                    handleProceedToPayment();
                  } else {
                    onConfirm(paymentMethod);
                  }
                }}
                disabled={isBooking || (effectiveStep === 'payment' && paymentMethod === 'WALLET' && insufficientBalance)}
                className="btn-3d flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-emerald px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('booking.payment.processing')}
                  </>
                ) : effectiveStep === 'rules' ? (
                  t('booking.rules.proceed')
                ) : (
                  t('booking.payment.confirmBooking')
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
