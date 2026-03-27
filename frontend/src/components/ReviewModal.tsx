'use client';

import React, { useState } from 'react';
import { Star, Loader2, X, MessageSquare, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { trackDriverRated } from '@/lib/analytics';
import toast from 'react-hot-toast';

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
            toast.success('Thank you for your review! 🌟');
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

    const starLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const displayScore = hoveredStar || score;

    return (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
            <div className="animate-scale-in relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-navy to-mint px-6 py-8 text-center">
                    <button
                        onClick={onClose}
                        className="absolute right-3 top-3 rounded-lg p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                        <Star className="h-7 w-7 text-amber-300" />
                    </div>
                    <h2 className="text-xl font-bold text-white">How was your ride?</h2>
                    <p className="mt-1 text-sm text-white/80">
                        Rate your experience with {driverName}
                    </p>
                </div>

                {submitted ? (
                    /* Success State */
                    <div className="flex flex-col items-center px-6 py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint/10">
                            <CheckCircle2 className="h-8 w-8 text-mint" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                            Review Submitted!
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                            Thank you for helping our community
                        </p>
                    </div>
                ) : (
                    /* Rating Form */
                    <div className="px-6 py-6">
                        {/* Stars */}
                        <div className="mb-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
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
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-zinc-200 dark:text-zinc-700'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 h-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                {displayScore > 0 ? starLabels[displayScore - 1] : 'Tap to rate'}
                            </p>
                        </div>

                        {/* Review Text */}
                        <div className="mt-4">
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Write a review (optional)
                            </label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Tell us about your experience..."
                                rows={3}
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition-colors focus:border-mint focus:bg-white focus:outline-none focus:ring-2 focus:ring-mint/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-800"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || score === 0}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-mint py-3.5 text-sm font-semibold text-white shadow-lg shadow-navy/20 transition-all hover:from-navy-light hover:to-mint-light hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
