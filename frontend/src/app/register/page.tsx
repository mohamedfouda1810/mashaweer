'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { TermsModal } from '@/components/TermsModal';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS_PASSENGER = ['Account Info'];
const STEPS_DRIVER = ['Account Info', 'Vehicle Details', 'Documents'];

export default function RegisterPage() {
    const router = useRouter();
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

                photoUrls.personalPhotoUrl = await upload(files.personalPhoto);
                photoUrls.identityPhotos = await Promise.all(files.identityPhotos.map(f => upload(f)));
                photoUrls.drivingLicensePhotos = await Promise.all(files.drivingLicensePhotos.map(f => upload(f)));
                photoUrls.carLicensePhotos = await Promise.all(files.carLicensePhotos.map(f => upload(f)));
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
            toast.success('Registration successful! Check your email.');
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
        'w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 transition-colors focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';

    if (registrationComplete) {
        return (
            <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-navy/10 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                        <Image src="/mashaweer-logo.png" alt="Mashaweer" width={40} height={40} className="h-10 w-10 object-contain" />
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <CheckCircle2 className="mx-auto h-16 w-16 text-mint mb-4" />
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Check Your Email! ✉️</h2>
                        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                            We sent a verification link to <strong className="text-zinc-900 dark:text-white">{form.email}</strong>.
                            Please click the link to verify your account.
                        </p>
                        {form.role === 'DRIVER' && (
                            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                                ⚠️ Your driver application will also need admin approval after verification.
                            </p>
                        )}
                        <Link
                            href="/login"
                            className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-navy to-mint py-3 text-sm font-semibold text-white shadow-sm"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-navy/10 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                        <Image src="/mashaweer-logo.png" alt="Mashaweer" width={36} height={36} className="h-9 w-9 object-contain" />
                    </div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                        Create an account
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Join Mashaweer and start traveling
                    </p>
                </div>

                {/* Step Indicator */}
                {form.role === 'DRIVER' && (
                    <div className="mb-5 flex items-center justify-center gap-2">
                        {steps.map((s, i) => (
                            <React.Fragment key={i}>
                                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                    i <= step
                                        ? 'bg-gradient-to-br from-navy to-mint text-white shadow-sm'
                                        : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700'
                                }`}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`h-0.5 w-8 rounded-full transition-all ${i < step ? 'bg-mint' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Form */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Step 0: Account Info */}
                    {step === 0 && (
                        <div className="space-y-4">
                            {/* Role Selection */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    I want to...
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { update('role', 'PASSENGER'); setStep(0); }}
                                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${form.role === 'PASSENGER'
                                            ? 'border-mint bg-mint/5 text-mint-dark dark:bg-mint/10 dark:text-mint-light shadow-sm'
                                            : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
                                            }`}
                                    >
                                        <Users className="h-4 w-4" />
                                        Book Rides
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => update('role', 'DRIVER')}
                                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${form.role === 'DRIVER'
                                            ? 'border-mint bg-mint/5 text-mint-dark dark:bg-mint/10 dark:text-mint-light shadow-sm'
                                            : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
                                            }`}
                                    >
                                        <CarFront className="h-4 w-4" />
                                        Drive & Earn
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <input required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Mohamed" className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Last Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <input required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Ahmed" className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <input type="tel" required value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="01xxxxxxxxx" className={inputClass} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <input type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="••••••" className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <input type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="••••••" className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                                <input
                                    id="terms-checkbox"
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-navy accent-navy focus:ring-navy"
                                />
                                <label htmlFor="terms-checkbox" className="text-xs text-zinc-600 dark:text-zinc-400">
                                    أوافق على{' '}
                                    <button type="button" onClick={() => setShowTerms(true)} className="font-semibold text-navy underline hover:text-navy-light dark:text-mint">
                                        الشروط والأحكام
                                    </button>
                                    {' '}الخاصة بمنصة مشاوير
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Vehicle Details (Driver only) */}
                    {step === 1 && form.role === 'DRIVER' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-navy to-mint text-sm font-bold text-white">🚗</div>
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Vehicle Details</h3>
                                    <p className="text-xs text-zinc-500">Your car information for passengers</p>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Car Model</label>
                                <input required value={form.carModel} onChange={(e) => update('carModel', e.target.value)} placeholder="e.g. Toyota Corolla 2022" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Plate Number</label>
                                    <input required value={form.plateNumber} onChange={(e) => update('plateNumber', e.target.value)} placeholder="ABC 1234" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">License #</label>
                                    <input required value={form.licenseNumber} onChange={(e) => update('licenseNumber', e.target.value)} placeholder="License #" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Documents (Driver only) */}
                    {step === 2 && form.role === 'DRIVER' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-navy to-mint text-sm font-bold text-white">📄</div>
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Upload Documents</h3>
                                    <p className="text-xs text-zinc-500">Upload 2 photos (front & back) for each</p>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Photo', done: !!files.personalPhoto },
                                    { label: 'ID', done: files.identityPhotos.length >= 2 },
                                    { label: 'License', done: files.drivingLicensePhotos.length >= 2 },
                                    { label: 'Car', done: files.carLicensePhotos.length >= 2 },
                                ].map((item) => (
                                    <span key={item.label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${item.done ? 'bg-mint/10 text-mint-dark' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'}`}>
                                        {item.done ? '✓' : '○'} {item.label}
                                    </span>
                                ))}
                            </div>

                            {/* Personal Photo */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">👤 Personal Photo</label>
                                <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-3 transition-colors hover:border-mint hover:bg-mint/5 dark:border-zinc-700 dark:bg-zinc-800/50">
                                    <UploadCloud className="h-5 w-5 text-zinc-400" />
                                    <span className="text-xs text-zinc-500">Click to upload</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('personalPhoto', e, 1)} />
                                </label>
                                {files.personalPhoto && (
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <img src={URL.createObjectURL(files.personalPhoto)} alt="Preview" className="h-10 w-10 rounded-lg border object-cover" />
                                        <span className="text-xs text-mint">✓</span>
                                        <button type="button" onClick={() => setFiles(prev => ({ ...prev, personalPhoto: null }))} className="ml-auto text-zinc-400 hover:text-red-500"><XCircle className="h-4 w-4" /></button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Identity */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">🪪 Identity (F & B)</label>
                                    <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-2.5 transition-colors hover:border-mint dark:border-zinc-700 dark:bg-zinc-800/50">
                                        <UploadCloud className="h-4 w-4 text-zinc-400" />
                                        <span className="text-[10px] text-zinc-500">Select 2 photos</span>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange('identityPhotos', e, 2)} />
                                    </label>
                                    {files.identityPhotos.length > 0 && (
                                        <div className="mt-1 flex items-center gap-1">
                                            {files.identityPhotos.map((f, i) => (<img key={i} src={URL.createObjectURL(f)} alt="ID" className="h-8 w-12 rounded border object-cover" />))}
                                            <span className="text-xs text-mint">{files.identityPhotos.length}/2</span>
                                        </div>
                                    )}
                                </div>
                                {/* Driving License */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">🚗 License (F & B)</label>
                                    <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-2.5 transition-colors hover:border-mint dark:border-zinc-700 dark:bg-zinc-800/50">
                                        <UploadCloud className="h-4 w-4 text-zinc-400" />
                                        <span className="text-[10px] text-zinc-500">Select 2 photos</span>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange('drivingLicensePhotos', e, 2)} />
                                    </label>
                                    {files.drivingLicensePhotos.length > 0 && (
                                        <div className="mt-1 flex items-center gap-1">
                                            {files.drivingLicensePhotos.map((f, i) => (<img key={i} src={URL.createObjectURL(f)} alt="License" className="h-8 w-12 rounded border object-cover" />))}
                                            <span className="text-xs text-mint">{files.drivingLicensePhotos.length}/2</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Car License */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">📄 Car License (F & B)</label>
                                <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-3 transition-colors hover:border-mint dark:border-zinc-700 dark:bg-zinc-800/50">
                                    <UploadCloud className="h-5 w-5 text-zinc-400" />
                                    <span className="text-xs text-zinc-500">Select 2 photos (front & back)</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange('carLicensePhotos', e, 2)} />
                                </label>
                                {files.carLicensePhotos.length > 0 && (
                                    <div className="mt-1 flex items-center gap-1">
                                        {files.carLicensePhotos.map((f, i) => (<img key={i} src={URL.createObjectURL(f)} alt="Car" className="h-8 w-12 rounded border object-cover" />))}
                                        <span className="text-xs text-mint">{files.carLicensePhotos.length}/2</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-5 flex gap-3">
                        {step > 0 && (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={isLoading || !canProceed()}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-navy to-mint py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {form.role === 'DRIVER' ? 'Uploading...' : 'Creating...'}
                                </>
                            ) : step < totalSteps - 1 ? (
                                <>
                                    Next
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            ) : (
                                form.role === 'DRIVER' ? 'Submit Application' : 'Create Account'
                            )}
                        </button>
                    </div>

                    <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} role={form.role} />

                    <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-mint hover:text-mint-dark dark:text-mint-light">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
