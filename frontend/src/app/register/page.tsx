'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { TermsModal } from '@/components/TermsModal';
import { useTranslation } from '@/hooks/useTranslation';
import {
    Mail,
    Lock,
    Phone,
    User,
    Loader2,
    Users,
    CarFront,
    UploadCloud,
    XCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS_PASSENGER = ['Account Info'];
const STEPS_DRIVER = ['Account Info', 'Vehicle Details', 'Documents'];

function RegisterFormContent() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'PASSENGER' as 'PASSENGER' | 'DRIVER',
        carModel: '',
        plateNumber: '',
        licenseNumber: '',
    });

    useEffect(() => {
        const paramRole = searchParams.get('role');
        if (paramRole && paramRole.toLowerCase() === 'driver') {
            setForm(prev => ({ ...prev, role: 'DRIVER' }));
        }
    }, [searchParams]);

    const [files, setFiles] = useState({
        personalPhoto: null as File | null,
        identityPhotos: [] as File[],
        drivingLicensePhotos: [] as File[],
        carLicensePhotos: [] as File[],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);

    const steps = form.role === 'DRIVER' ? STEPS_DRIVER : STEPS_PASSENGER;
    const totalSteps = steps.length;

    const handleFileChange = (field: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>, maxCount: number = 2) => {
        if (e.target.files) {
            const arr = Array.from(e.target.files);
            if (field === 'personalPhoto') {
                setFiles(prev => ({ ...prev, [field]: arr[0] }));
            } else {
                setFiles(prev => ({ ...prev, [field]: arr.slice(0, maxCount) }));
            }
        }
    };

    const update = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const canProceed = () => {
        if (step === 0) {
            return form.firstName && form.lastName && form.email && form.phone && form.password && form.confirmPassword && form.password === form.confirmPassword && agreedToTerms;
        }
        if (step === 1 && form.role === 'DRIVER') {
            return form.carModel && form.plateNumber && form.licenseNumber;
        }
        if (step === 2 && form.role === 'DRIVER') {
            return files.personalPhoto && files.identityPhotos.length >= 2 && files.drivingLicensePhotos.length >= 2 && files.carLicensePhotos.length >= 2;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            let photoUrls: any = {};

            if (form.role === 'DRIVER') {
                if (!files.personalPhoto || files.identityPhotos.length < 2 || files.drivingLicensePhotos.length < 2 || files.carLicensePhotos.length < 2) {
                    setError('Please upload all required driver photos (2 of each required front & back)');
                    setIsLoading(false);
                    return;
                }

                const upload = async (file: File) => (await api.uploadFile(file)).url;

                // Upload all files in parallel for faster registration
                const [personalUrl, identityUrls, licenseUrls, carUrls] = await Promise.all([
                  upload(files.personalPhoto),
                  Promise.all(files.identityPhotos.map(f => upload(f))),
                  Promise.all(files.drivingLicensePhotos.map(f => upload(f))),
                  Promise.all(files.carLicensePhotos.map(f => upload(f))),
                ]);
                photoUrls.personalPhotoUrl = personalUrl;
                photoUrls.identityPhotos = identityUrls;
                photoUrls.drivingLicensePhotos = licenseUrls;
                photoUrls.carLicensePhotos = carUrls;
            }

            await api.register({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: form.phone,
                password: form.password,
                role: form.role,
                ...(form.role === 'DRIVER'
                    ? {
                        carModel: form.carModel,
                        plateNumber: form.plateNumber,
                        licenseNumber: form.licenseNumber,
                        ...photoUrls,
                    }
                    : {}),
            });
            setRegistrationComplete(true);
            toast.success('Registration successful!');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        if (step < totalSteps - 1) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const inputClass =
        'w-full rounded-xl border border-white/20 bg-white/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 backdrop-blur-md transition-all focus:border-emerald focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald/20 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:bg-zinc-800';

    if (registrationComplete) {
        return (
            <div className="gradient-hero flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald/20 blur-[120px]" />
                    <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-navy-light/20 blur-[100px]" />
                </div>
                <div className="w-full max-w-md text-center z-10 animate-fade-in-up">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl shadow-navy/10 border border-white/40 dark:bg-zinc-900/80 dark:border-zinc-800/50">
                        <Image src="/mashaweer-logo.png" alt={t('common.mashaweer') || 'Mashaweer'} width={40} height={40} className="h-10 w-10 object-contain" />
                    </div>
                    <div className="glass-card rounded-2xl p-8 shadow-2xl relative">
                        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald mb-4 animate-scale-in" />
                        {form.role === 'DRIVER' ? (
                            <>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('register.success.driver.title')}</h2>
                                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    {t('register.success.driver.desc')}
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('register.success.passenger.title')}</h2>
                                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    {t('register.success.passenger.desc')}
                                </p>
                            </>
                        )}
                        <Link
                            href="/login"
                            className="btn-3d btn-liquid mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-navy to-emerald py-3 text-sm font-semibold text-white shadow-lg"
                        >
                            {t('register.signIn')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="gradient-hero relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8 sm:py-12 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald/20 blur-[120px]" />
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-navy-light/20 blur-[100px]" />
            </div>

            <div className="w-full max-w-lg z-10 animate-fade-in-up">
                {/* Header */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl shadow-navy/10 border border-white/40 dark:bg-zinc-900/80 dark:border-zinc-800/50">
                        <Image src="/mashaweer-logo.png" alt={t('common.mashaweer') || 'Mashaweer'} width={36} height={36} className="h-9 w-9 object-contain" />
                    </div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                        {t('register.title')}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {t('register.subtitle')}
                    </p>
                </div>

                {/* Step Indicator */}
                {form.role === 'DRIVER' && (
                    <div className="mb-6 flex items-center justify-center gap-2">
                        {steps.map((s, i) => {
                            const isActive = i === step;
                            const isCompleted = i < step;
                            return (
                                <React.Fragment key={i}>
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                                        isActive
                                            ? 'bg-navy text-white shadow-lg shadow-navy/30 scale-110 ring-4 ring-navy/20'
                                            : isCompleted
                                                ? 'bg-emerald text-white shadow-md shadow-emerald/20'
                                                : 'glass-card text-zinc-500 border-white/40 bg-white/40 dark:bg-zinc-800/40'
                                    }`}>
                                        {isCompleted ? '✓' : i + 1}
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`h-1 w-12 rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/30 dark:bg-zinc-700/50 backdrop-blur-sm'}`} />
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>
                )}

                {/* Form */}
                <div className="glass-card rounded-2xl p-5 shadow-2xl sm:p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/40 dark:bg-zinc-900/40 pointer-events-none backdrop-blur-3xl" />
                    <div className="relative z-10 animate-scale-in" key={step}>
                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50/80 backdrop-blur-sm p-3 text-sm text-red-700 border border-red-100 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Step 0: Account Info */}
                        {step === 0 && (
                            <div className="space-y-4">
                                {/* Role Selection */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        {t('register.iWantTo')}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { update('role', 'PASSENGER'); setStep(0); }}
                                            className={`hover-lift flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${form.role === 'PASSENGER'
                                                ? 'border-emerald bg-emerald/10 text-emerald-700 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                                : 'glass-card border-white/40 text-zinc-600 hover:border-white/60 dark:border-zinc-700/50 dark:text-zinc-400 bg-white/20 dark:bg-zinc-800/20'
                                                }`}
                                        >
                                            <Users className="h-4 w-4" />
                                            {t('register.bookRides')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => update('role', 'DRIVER')}
                                            className={`hover-lift flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${form.role === 'DRIVER'
                                                ? 'border-emerald bg-emerald/10 text-emerald-700 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                                : 'glass-card border-white/40 text-zinc-600 hover:border-white/60 dark:border-zinc-700/50 dark:text-zinc-400 bg-white/20 dark:bg-zinc-800/20'
                                                }`}
                                        >
                                            <CarFront className="h-4 w-4" />
                                            {t('register.driveEarn')}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('register.firstName')}</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                            <input required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Mohamed" className={inputClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('register.lastName')}</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                            <input required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Ahmed" className={inputClass} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('register.email')}</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" className={inputClass} />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('register.phone')}</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <input type="tel" required value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="01xxxxxxxxx" className={inputClass} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('register.password')}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                            <input type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="••••••" className={inputClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('register.confirmPassword')}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                            <input type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="••••••" className={inputClass} />
                                        </div>
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="flex items-start gap-3 rounded-xl glass-card bg-white/30 border border-white/40 p-3 dark:bg-zinc-800/30 dark:border-zinc-700/50">
                                    <input
                                        id="terms-checkbox"
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/50 bg-white/50 text-navy accent-navy focus:ring-navy transition-all"
                                    />
                                    <label htmlFor="terms-checkbox" className="text-xs text-zinc-600 dark:text-zinc-400">
                                        {t('register.agreeTerms')}{' '}
                                        <button type="button" onClick={() => setShowTerms(true)} className="font-semibold text-navy underline hover:text-navy-light dark:text-emerald">
                                            {t('register.termsConditions')}
                                        </button>
                                        {' '}{t('register.ofPlatform')}
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Vehicle Details (Driver only) */}
                        {step === 1 && form.role === 'DRIVER' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-navy to-emerald text-sm font-bold text-white shadow-lg shadow-emerald/20">🚗</div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{t('register.vehicleDetails')}</h3>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('register.carModel')}</label>
                                    <input required value={form.carModel} onChange={(e) => update('carModel', e.target.value)} placeholder="e.g. Toyota Corolla 2022" className={inputClass} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('register.plateNumber')}</label>
                                        <input required value={form.plateNumber} onChange={(e) => update('plateNumber', e.target.value)} placeholder="ABC 1234" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('register.licenseNumber')}</label>
                                        <input required value={form.licenseNumber} onChange={(e) => update('licenseNumber', e.target.value)} placeholder="License #" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Documents (Driver only) */}
                        {step === 2 && form.role === 'DRIVER' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-navy to-emerald text-sm font-bold text-white shadow-lg shadow-emerald/20">📄</div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{t('register.documents')}</h3>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: t('register.personalPhoto'), done: !!files.personalPhoto },
                                        { label: t('register.identity'), done: files.identityPhotos.length >= 2 },
                                        { label: t('register.drivingLicense'), done: files.drivingLicensePhotos.length >= 2 },
                                        { label: t('register.carLicense'), done: files.carLicensePhotos.length >= 2 },
                                    ].map((item) => (
                                        <span key={item.label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm transition-all ${item.done ? 'bg-emerald/20 text-emerald-800 dark:text-emerald-300 border border-emerald/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-white/40 text-zinc-600 dark:bg-zinc-800/40 border border-white/20'}`}>
                                            {item.done ? '✓' : '○'} {item.label}
                                        </span>
                                    ))}
                                </div>

                                {/* Personal Photo */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">👤 {t('register.personalPhoto')}</label>
                                    <label className="hover-lift flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-zinc-300/60 bg-white/40 p-3 transition-colors hover:border-emerald hover:bg-emerald/5 dark:border-zinc-700/60 dark:bg-zinc-800/40">
                                        <UploadCloud className="h-5 w-5 text-zinc-400" />
                                        <span className="text-xs text-zinc-500">{t('register.clickToUpload')}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('personalPhoto', e, 1)} />
                                    </label>
                                    {files.personalPhoto && (
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <img src={URL.createObjectURL(files.personalPhoto)} alt="Preview" className="h-10 w-10 rounded-lg border border-white/40 shadow-sm object-cover" />
                                            <span className="text-xs text-emerald font-bold">✓</span>
                                            <button type="button" onClick={() => setFiles(prev => ({ ...prev, personalPhoto: null }))} className="ml-auto text-zinc-400 hover:text-red-500 transition-colors"><XCircle className="h-4 w-4" /></button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Identity */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">🪪 {t('register.identity')}</label>
                                        <label className="hover-lift flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-zinc-300/60 bg-white/40 p-2.5 transition-colors hover:border-emerald hover:bg-emerald/5 dark:border-zinc-700/60 dark:bg-zinc-800/40">
                                            <UploadCloud className="h-4 w-4 text-zinc-400" />
                                            <span className="text-[10px] text-zinc-500">{t('register.selectPhotos')}</span>
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange('identityPhotos', e, 2)} />
                                        </label>
                                        {files.identityPhotos.length > 0 && (
                                            <div className="mt-1 flex items-center gap-1">
                                                {files.identityPhotos.map((f, i) => (<img key={i} src={URL.createObjectURL(f)} alt="ID" className="h-8 w-12 rounded border border-white/40 shadow-sm object-cover" />))}
                                                <span className="text-xs text-emerald font-bold">{files.identityPhotos.length}/2</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Driving License */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">🚗 {t('register.drivingLicense')}</label>
                                        <label className="hover-lift flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-zinc-300/60 bg-white/40 p-2.5 transition-colors hover:border-emerald hover:bg-emerald/5 dark:border-zinc-700/60 dark:bg-zinc-800/40">
                                            <UploadCloud className="h-4 w-4 text-zinc-400" />
                                            <span className="text-[10px] text-zinc-500">{t('register.selectPhotos')}</span>
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange('drivingLicensePhotos', e, 2)} />
                                        </label>
                                        {files.drivingLicensePhotos.length > 0 && (
                                            <div className="mt-1 flex items-center gap-1">
                                                {files.drivingLicensePhotos.map((f, i) => (<img key={i} src={URL.createObjectURL(f)} alt="License" className="h-8 w-12 rounded border border-white/40 shadow-sm object-cover" />))}
                                                <span className="text-xs text-emerald font-bold">{files.drivingLicensePhotos.length}/2</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Car License */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">📄 {t('register.carLicense')}</label>
                                    <label className="hover-lift flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-zinc-300/60 bg-white/40 p-3 transition-colors hover:border-emerald hover:bg-emerald/5 dark:border-zinc-700/60 dark:bg-zinc-800/40">
                                        <UploadCloud className="h-5 w-5 text-zinc-400" />
                                        <span className="text-xs text-zinc-500">{t('register.selectPhotos')}</span>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange('carLicensePhotos', e, 2)} />
                                    </label>
                                    {files.carLicensePhotos.length > 0 && (
                                        <div className="mt-1 flex items-center gap-1">
                                            {files.carLicensePhotos.map((f, i) => (<img key={i} src={URL.createObjectURL(f)} alt="Car" className="h-8 w-12 rounded border border-white/40 shadow-sm object-cover" />))}
                                            <span className="text-xs text-emerald font-bold">{files.carLicensePhotos.length}/2</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-6 flex gap-3">
                            {step > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="hover-lift glass-card flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium text-zinc-700 hover:bg-white/50 dark:text-zinc-300 border-white/40"
                                >
                                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                                    Back
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isLoading || !canProceed()}
                                className="btn-3d btn-liquid flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-navy to-emerald py-2.5 text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {form.role === 'DRIVER' ? 'Uploading...' : 'Creating...'}
                                    </>
                                ) : step < totalSteps - 1 ? (
                                    <>
                                        Next
                                        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                                    </>
                                ) : (
                                    form.role === 'DRIVER' ? t('register.submitApplication') : t('register.createAccount')
                                )}
                            </button>
                        </div>
                        
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-white/20 dark:bg-zinc-800/20 py-2 px-3 rounded-lg border border-white/30 backdrop-blur-sm">
                            <ShieldCheck className="h-4 w-4 text-emerald" />
                            <span>{t('common.secureEncrypted')}</span>
                        </div>

                        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                            {t('register.haveAccount')}{' '}
                            <Link href="/login" className="font-semibold text-navy hover:text-emerald dark:text-emerald dark:hover:text-emerald-300 transition-colors">
                                {t('register.signIn')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} role={form.role} />
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const { isAuthenticated, hasHydrated } = useAuthStore();
    
    useEffect(() => {
        if (hasHydrated && isAuthenticated) {
            router.replace('/trips');
        }
    }, [hasHydrated, isAuthenticated, router]);
    
    if (!hasHydrated) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald" />
            </div>
        );
    }
    
    if (isAuthenticated) return null;

    return (
        <Suspense fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald" />
            </div>
        }>
            <RegisterFormContent />
        </Suspense>
    );
}
