'use client';

import React, { useState } from 'react';
import { Star, Loader2, X, MessageSquare, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { trackDriverRated } from '@/lib/analytics';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    driverId: string;
    driverName: string;
    onSuccess?: () => void;
}

export function ReviewModal({
    isOpen,
    onClose,
    tripId,
    driverId,
    driverName,
    onSuccess,
}: ReviewModalProps) {
    const { t, locale } = useTranslation();
    const [score, setScore] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (score === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.submitRating({
                ratedId: driverId,
                tripId,
                score,
                review: review.trim() || undefined,
            });
            trackDriverRated(tripId, driverId, score);
            setSubmitted(true);
            toast.success(t('review.success'));
            onSuccess?.();
            // Auto-close after 2 seconds
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setScore(0);
                setReview('');
            }, 2000);
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const starLabels = [t('review.star1'), t('review.star2'), t('review.star3'), t('review.star4'), t('review.star5')];
    const displayScore = hoveredStar || score;

    return (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-end justify-center bg-navy-900/50 p-4 backdrop-blur-md sm:items-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="animate-scale-in relative w-full max-w-md overflow-hidden rounded-2xl bg-white/80 shadow-2xl backdrop-blur-xl border border-white/20 dark:bg-navy-950/80 dark:border-white/10">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-navy to-emerald px-6 py-8 text-center">
                    <button
                        onClick={onClose}
                        className="absolute right-3 top-3 rounded-lg p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                        <Star className="h-7 w-7 text-amber-300 fill-amber-300" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{t('review.title')}</h2>
                    <p className="mt-1 text-sm text-emerald-50">
                        {t('review.rateExperience')} {driverName}
                    </p>
                </div>

                {submitted ? (
                    /* Success State */
                    <div className="flex flex-col items-center px-6 py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                            {t('review.success')}
                        </h3>
                        <p className="mt-1 text-sm text-navy-600 dark:text-navy-400">
                            {t('review.thankYou')}
                        </p>
                    </div>
                ) : (
                    /* Rating Form */
                    <div className="px-6 py-6">
                        {/* Stars */}
                        <div className="mb-2 text-center">
                            <div className="flex items-center justify-center gap-2 flex-row-reverse">
                                {[5, 4, 3, 2, 1].map((s) => (
                                    <button
                                        key={s}
                                        onMouseEnter={() => setHoveredStar(s)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        onClick={() => setScore(s)}
                                        className="group transition-transform hover:scale-125 active:scale-95"
                                    >
                                        <Star
                                            className={`h-10 w-10 transition-colors ${
                                                s <= displayScore
                                                    ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                                                    : 'text-black/10 dark:text-white/10'
                                            }`}
                                        />
                                    </button>
                                )).reverse()}
                            </div>
                            <p className="mt-2 h-5 text-sm font-medium text-navy-600 dark:text-navy-400">
                                {displayScore > 0 ? starLabels[displayScore - 1] : t('review.tapToRate')}
                            </p>
                        </div>

                        {/* Review Text */}
                        <div className="mt-4">
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-navy-700 dark:text-navy-300">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {t('review.writeReview')}
                            </label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder={t('review.placeholder')}
                                rows={3}
                                className="w-full rounded-xl border border-black/10 bg-white/50 px-4 py-3 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || score === 0}
                            className="mt-4 btn-3d flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-emerald py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t('review.submitting')}
                                </>
                            ) : (
                                t('review.submit')
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
