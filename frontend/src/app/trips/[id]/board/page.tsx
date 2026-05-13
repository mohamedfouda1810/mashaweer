'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTripStore } from '@/stores/useTripStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Camera,
    CheckCircle2,
    Loader2,
    Users,
    Navigation,
    Clock,
    Phone,
    XCircle,
    Plus,
    X,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BoardedPassenger {
    bookingId: string;
    passengerName: string;
    maskedPhone: string;
    seats: number;
    boardedAt: string;
}

type ScanState =
    | { status: 'idle' }
    | { status: 'scanning' }
    | { status: 'processing'; token: string }
    | { status: 'success'; name: string; seats: number }
    | { status: 'error'; message: string };

// ─── Camera Scanner Modal ─────────────────────────────────────────────────────

function CameraScannerModal({
    tripId,
    onClose,
    onBoarded,
}: {
    tripId: string;
    onClose: () => void;
    onBoarded: (passenger: BoardedPassenger) => void;
}) {
    const scannerRef = useRef<HTMLDivElement>(null);
    const html5QrRef = useRef<any>(null);
    const [scanState, setScanState] = useState<ScanState>({ status: 'scanning' });

    const stopScanner = useCallback(async () => {
        if (html5QrRef.current) {
            try {
                await html5QrRef.current.stop();
                await html5QrRef.current.clear();
            } catch (_) {
                // ignore cleanup errors
            }
            html5QrRef.current = null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const startScanner = async () => {
            if (!scannerRef.current) return;
            try {
                const { Html5Qrcode } = await import('html5-qrcode');
                const scanner = new Html5Qrcode('qr-reader');
                html5QrRef.current = scanner;

                await scanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    async (decodedText) => {
                        if (!mounted) return;
                        setScanState({ status: 'processing', token: decodedText });
                        await stopScanner();

                        let boardingToken: string | null = null;
                        try {
                            const payload = JSON.parse(decodedText);
                            boardingToken = payload.boardingToken || null;
                        } catch {
                            boardingToken = null;
                        }

                        if (!boardingToken) {
                            if (mounted) setScanState({ status: 'error', message: 'رمز QR غير صحيح' });
                            return;
                        }

                        try {
                            const res = await api.boardPassenger(tripId, boardingToken);
                            if (!mounted) return;
                            const data = res.data!;
                            setScanState({ status: 'success', name: data.passengerName, seats: data.seatNumber });
                            onBoarded({
                                bookingId: boardingToken,
                                passengerName: data.passengerName,
                                maskedPhone: '—',
                                seats: data.seatNumber,
                                boardedAt: data.boardedAt,
                            });
                        } catch (err: any) {
                            if (!mounted) return;
                            const msg: string = err.message || 'حدث خطأ';
                            setScanState({ status: 'error', message: msg });
                        }
                    },
                    () => { /* ignore QR frame errors */ },
                );
            } catch (err: any) {
                if (mounted) {
                    setScanState({ status: 'error', message: 'تعذّر فتح الكاميرا. تحقق من الصلاحيات.' });
                }
            }
        };

        startScanner();

        return () => {
            mounted = false;
            stopScanner();
        };
    }, [tripId, stopScanner, onBoarded]);

    const handleScanAnother = async () => {
        setScanState({ status: 'scanning' });
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('qr-reader');
        html5QrRef.current = scanner;
        try {
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText) => {
                    setScanState({ status: 'processing', token: decodedText });
                    await stopScanner();

                    let boardingToken: string | null = null;
                    try {
                        const payload = JSON.parse(decodedText);
                        boardingToken = payload.boardingToken || null;
                    } catch { boardingToken = null; }

                    if (!boardingToken) {
                        setScanState({ status: 'error', message: 'رمز QR غير صحيح' });
                        return;
                    }

                    try {
                        const res = await api.boardPassenger(tripId, boardingToken);
                        const data = res.data!;
                        setScanState({ status: 'success', name: data.passengerName, seats: data.seatNumber });
                        onBoarded({
                            bookingId: boardingToken,
                            passengerName: data.passengerName,
                            maskedPhone: '—',
                            seats: data.seatNumber,
                            boardedAt: data.boardedAt,
                        });
                    } catch (err: any) {
                        setScanState({ status: 'error', message: err.message || 'حدث خطأ' });
                    }
                },
                () => { },
            );
        } catch {
            setScanState({ status: 'error', message: 'تعذّر فتح الكاميرا. تحقق من الصلاحيات.' });
        }
    };

    const handleClose = async () => {
        await stopScanner();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80">
                <h2 className="text-lg font-bold text-white">مسح رمز QR</h2>
                <button
                    onClick={handleClose}
                    className="rounded-full p-2 text-white hover:bg-white/10"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Scanner viewport */}
            <div className="flex-1 relative flex flex-col items-center justify-center">
                <div id="qr-reader" ref={scannerRef} className="w-full max-w-sm" />

                {scanState.status !== 'scanning' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6">
                        {scanState.status === 'processing' && (
                            <div className="text-center">
                                <Loader2 className="mx-auto h-12 w-12 animate-spin text-teal-400" />
                                <p className="mt-4 text-lg font-semibold text-white">جاري التسجيل...</p>
                            </div>
                        )}

                        {scanState.status === 'success' && (
                            <div className="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 text-center">
                                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
                                <p className="mt-4 text-xl font-bold text-white">{scanState.name}</p>
                                <p className="mt-1 text-sm text-zinc-400">{scanState.seats} مقعد — تم التسجيل ✅</p>
                                <div className="mt-6 flex flex-col gap-3">
                                    <button
                                        onClick={handleScanAnother}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-500"
                                    >
                                        <Plus className="h-4 w-4" />
                                        إضافة راكب آخر
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="rounded-xl border border-zinc-600 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </div>
                        )}

                        {scanState.status === 'error' && (
                            <div className="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 text-center">
                                <XCircle className="mx-auto h-16 w-16 text-red-400" />
                                <p className="mt-4 text-lg font-bold text-white">خطأ</p>
                                <p className="mt-2 text-sm text-red-300">{scanState.message}</p>
                                <div className="mt-6 flex flex-col gap-3">
                                    <button
                                        onClick={handleScanAnother}
                                        className="rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-500"
                                    >
                                        المحاولة مرة أخرى
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="rounded-xl border border-zinc-600 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {scanState.status === 'scanning' && (
                    <p className="absolute bottom-8 text-sm text-zinc-400">وجّه الكاميرا نحو رمز QR الخاص بالراكب</p>
                )}
            </div>
        </div>
    );
}

// ─── Main Board Page ──────────────────────────────────────────────────────────

export default function BoardPage() {
    const params = useParams();
    const router = useRouter();
    const tripId = params.id as string;
    const { user, isAuthenticated } = useAuthStore();
    const { selectedTrip: trip, fetchTrip } = useTripStore();

    const [boardedPassengers, setBoardedPassengers] = useState<BoardedPassenger[]>([]);
    const [loadingPassengers, setLoadingPassengers] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const [startingTrip, setStartingTrip] = useState(false);

    useEffect(() => {
        if (!tripId) return;
        fetchTrip(tripId);
    }, [tripId, fetchTrip]);

    useEffect(() => {
        if (!trip) return;
        if (!isAuthenticated || user?.role !== 'DRIVER' || trip.driverId !== user.id) {
            router.replace(`/trips/${tripId}`);
        }
    }, [trip, isAuthenticated, user, tripId, router]);

    const refreshPassengers = useCallback(async () => {
        setLoadingPassengers(true);
        try {
            const res = await api.getBoardedPassengers(tripId);
            setBoardedPassengers(res.data || []);
        } catch {
            // ignore
        } finally {
            setLoadingPassengers(false);
        }
    }, [tripId]);

    useEffect(() => {
        if (tripId) refreshPassengers();
    }, [tripId, refreshPassengers]);

    const handlePassengerBoarded = useCallback((passenger: BoardedPassenger) => {
        setBoardedPassengers((prev) => {
            if (prev.some((p) => p.bookingId === passenger.bookingId)) return prev;
            return [...prev, passenger];
        });
        toast.success(`تم تسجيل ${passenger.passengerName} ✅`);
    }, []);

    const handleStartTrip = async () => {
        if (!trip) return;
        setStartingTrip(true);
        try {
            await api.startTrip(trip.id);
            toast.success('بدأت الرحلة! 🚀');
            router.push(`/trips/${tripId}`);
        } catch (err: any) {
            toast.error(err.message || 'فشل بدء الرحلة');
        } finally {
            setStartingTrip(false);
        }
    };

    if (!trip) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" dir="rtl">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push(`/trips/${tripId}`)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">تسجيل الركاب</h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {trip.fromCity} ← {trip.toCity}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 dark:bg-emerald-900/30">
                        <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            {boardedPassengers.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Body — pb-56 leaves room for the fixed bottom bar + mobile navbar */}
            <div className="mx-auto max-w-lg space-y-4 px-4 py-6 pb-56">
                {loadingPassengers ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                    </div>
                ) : boardedPassengers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-14 dark:border-zinc-800">
                        <Users className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                        <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            لا يوجد ركاب مسجلين بعد
                        </p>
                        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                            اضغط "إضافة راكب" لمسح رمز QR
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {boardedPassengers.map((p, i) => (
                            <div
                                key={`${p.bookingId}-${i}`}
                                className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 text-sm font-bold text-white">
                                    {p.passengerName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        {p.passengerName}
                                    </p>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                                        <span className="flex items-center gap-0.5">
                                            <Phone className="h-3 w-3" />
                                            {p.maskedPhone}
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            <Clock className="h-3 w-3" />
                                            {new Date(p.boardedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span>{p.seats} مقعد</span>
                                    </div>
                                </div>
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Fixed Bottom Actions
                bottom-16 = clears the mobile bottom navbar (64px)
                so buttons are always visible above the nav bar     */}
            <div className="fixed bottom-16 inset-x-0 border-t border-zinc-200 bg-white px-4 pt-3 pb-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
                <button
                    onClick={() => setShowScanner(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:from-teal-500 hover:to-emerald-500 hover:shadow-md active:scale-[0.98]"
                >
                    <Camera className="h-5 w-5" />
                    إضافة راكب
                </button>

                <button
                    onClick={handleStartTrip}
                    disabled={boardedPassengers.length === 0 || startingTrip || trip.status === 'IN_PROGRESS'}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-blue-500 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {startingTrip ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Navigation className="h-5 w-5" />
                    )}
                    {trip.status === 'IN_PROGRESS' ? 'الرحلة جارية بالفعل ✅' : 'بدء الرحلة'}
                </button>

                {boardedPassengers.length === 0 && (
                    <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
                        سجّل راكباً واحداً على الأقل لبدء الرحلة
                    </p>
                )}
            </div>

            {/* QR Camera Scanner Modal */}
            {showScanner && (
                <CameraScannerModal
                    tripId={tripId}
                    onClose={() => setShowScanner(false)}
                    onBoarded={handlePassengerBoarded}
                />
            )}
        </div>
    );
}
