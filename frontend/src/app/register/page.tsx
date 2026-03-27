'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { TermsModal } from '@/components/TermsModal';
import {
    Car,
    Mail,
    Lock,
    Phone,
    User,
    Loader2,
    Users,
    CarFront,
    UploadCloud,
    XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                
                // Upload files first
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
            toast.success(form.role === 'DRIVER' 
                ? 'Registration submitted! Awaiting admin approval.' 
                : 'Registration successful! Please sign in.');
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass =
        'w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 shadow-xl shadow-teal-500/20">
                        <Car className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Create an account
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Join Mashaweer and start traveling
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            I want to...
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => update('role', 'PASSENGER')}
                                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${form.role === 'PASSENGER'
                                    ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
                                    }`}
                            >
                                <Users className="h-4 w-4" />
                                Book Rides
                            </button>
                            <button
                                type="button"
                                onClick={() => update('role', 'DRIVER')}
                                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${form.role === 'DRIVER'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
                                    }`}
                            >
                                <CarFront className="h-4 w-4" />
                                Drive & Earn
                            </button>
                        </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                First Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    required
                                    value={form.firstName}
                                    onChange={(e) => update('firstName', e.target.value)}
                                    placeholder="Mohamed"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Last Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    required
                                    value={form.lastName}
                                    onChange={(e) => update('lastName', e.target.value)}
                                    placeholder="Ahmed"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => update('email', e.target.value)}
                                placeholder="you@example.com"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Phone
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="tel"
                                required
                                value={form.phone}
                                onChange={(e) => update('phone', e.target.value)}
                                placeholder="01xxxxxxxxx"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={form.password}
                                    onChange={(e) => update('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={form.confirmPassword}
                                    onChange={(e) => update('confirmPassword', e.target.value)}
                                    placeholder="••••••••"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Driver Fields */}
                    {form.role === 'DRIVER' && (
                        <div className="space-y-5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                            {/* Section Header */}
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">1</div>
                                <div>
                                    <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Vehicle Details</h3>
                                    <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">Your car information for passengers</p>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Car Model
                                </label>
                                <input
                                    required
                                    value={form.carModel}
                                    onChange={(e) => update('carModel', e.target.value)}
                                    placeholder="e.g. Toyota Corolla 2022"
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Plate Number
                                    </label>
                                    <input
                                        required
                                        value={form.plateNumber}
                                        onChange={(e) => update('plateNumber', e.target.value)}
                                        placeholder="ABC 1234"
                                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        License Number
                                    </label>
                                    <input
                                        required
                                        value={form.licenseNumber}
                                        onChange={(e) => update('licenseNumber', e.target.value)}
                                        placeholder="License #"
                                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                    />
                                </div>
                            </div>
                            
                            {/* Upload Documents Section */}
                            <div className="space-y-4 border-t border-emerald-200/60 pt-5 dark:border-emerald-800/40">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">2</div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Upload Documents</h3>
                                        <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">Upload 2 photos (front & back) for each document</p>
                                    </div>
                                </div>

                                {/* Progress Summary */}
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: 'Photo', done: !!files.personalPhoto },
                                        { label: 'ID', done: files.identityPhotos.length >= 2 },
                                        { label: 'License', done: files.drivingLicensePhotos.length >= 2 },
                                        { label: 'Car', done: files.carLicensePhotos.length >= 2 },
                                    ].map((item) => (
                                        <span key={item.label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${item.done
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'}`}>
                                            {item.done ? '✓' : '○'} {item.label}
                                        </span>
                                    ))}
                                </div>
                                
                                {/* Personal Photo */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                        👤 Personal Photo
                                    </label>
                                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-4 transition-colors hover:border-teal-400 hover:bg-teal-50/50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-teal-600">
                                        <UploadCloud className="h-6 w-6 text-zinc-400" />
                                        <span className="text-xs text-zinc-500">Click to upload your photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('personalPhoto', e, 1)} />
                                    </label>
                                    {files.personalPhoto && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img src={URL.createObjectURL(files.personalPhoto)} alt="Preview" className="h-12 w-12 rounded-lg border object-cover" />
                                            <span className="text-xs text-emerald-600">✓ Uploaded</span>
                                            <button type="button" onClick={() => setFiles(prev => ({ ...prev, personalPhoto: null }))} className="ml-auto text-zinc-400 hover:text-red-500"><XCircle className="h-4 w-4" /></button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Identity Photos */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                            🪪 Identity (Front & Back)
                                        </label>
                                        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-3 transition-colors hover:border-teal-400 hover:bg-teal-50/50 dark:border-zinc-700 dark:bg-zinc-800/50">
                                            <UploadCloud className="h-5 w-5 text-zinc-400" />
                                            <span className="text-xs text-zinc-500">Select 2 photos</span>
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange('identityPhotos', e, 2)} />
                                        </label>
                                        {files.identityPhotos.length > 0 && (
                                            <div className="mt-2 flex items-center gap-2">
                                                {files.identityPhotos.map((f, i) => (
                                                    <img key={i} src={URL.createObjectURL(f)} alt="ID" className="h-10 w-14 rounded border object-cover" />
                                                ))}
                                                <span className="text-xs text-emerald-600">{files.identityPhotos.length}/2</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Driving License */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                            🚗 Driving License (Front & Back)
                                        </label>
                                        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-3 transition-colors hover:border-teal-400 hover:bg-teal-50/50 dark:border-zinc-700 dark:bg-zinc-800/50">
                                            <UploadCloud className="h-5 w-5 text-zinc-400" />
                                            <span className="text-xs text-zinc-500">Select 2 photos</span>
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange('drivingLicensePhotos', e, 2)} />
                                        </label>
                                        {files.drivingLicensePhotos.length > 0 && (
                                            <div className="mt-2 flex items-center gap-2">
                                                {files.drivingLicensePhotos.map((f, i) => (
                                                    <img key={i} src={URL.createObjectURL(f)} alt="License" className="h-10 w-14 rounded border object-cover" />
                                                ))}
                                                <span className="text-xs text-emerald-600">{files.drivingLicensePhotos.length}/2</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Car License */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                        📄 Car License (Front & Back)
                                    </label>
                                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-4 transition-colors hover:border-teal-400 hover:bg-teal-50/50 dark:border-zinc-700 dark:bg-zinc-800/50">
                                        <UploadCloud className="h-6 w-6 text-zinc-400" />
                                        <span className="text-xs text-zinc-500">Select 2 photos (front & back)</span>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange('carLicensePhotos', e, 2)} />
                                    </label>
                                    {files.carLicensePhotos.length > 0 && (
                                        <div className="mt-2 flex items-center gap-2">
                                            {files.carLicensePhotos.map((f, i) => (
                                                <img key={i} src={URL.createObjectURL(f)} alt="Car License" className="h-10 w-14 rounded border object-cover" />
                                            ))}
                                            <span className="text-xs text-emerald-600">{files.carLicensePhotos.length}/2</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Terms & Conditions */}
                    <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                        <input
                            id="terms-checkbox"
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-navy accent-navy focus:ring-navy"
                        />
                        <label htmlFor="terms-checkbox" className="text-sm text-zinc-600 dark:text-zinc-400">
                            أوافق على{' '}
                            <button
                                type="button"
                                onClick={() => setShowTerms(true)}
                                className="font-semibold text-navy underline hover:text-navy-light dark:text-mint"
                            >
                                الشروط والأحكام
                            </button>
                            {' '}الخاصة بمنصة مشاوير
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !agreedToTerms}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-navy to-mint py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-navy-light hover:to-mint-light hover:shadow-md active:scale-[0.98] disabled:opacity-60"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {form.role === 'DRIVER' ? 'Uploading & registering...' : 'Creating account...'}
                            </>
                        ) : (
                            form.role === 'DRIVER' ? 'Submit Application' : 'Create Account'
                        )}
                    </button>

                    {/* Terms Modal */}
                    <TermsModal
                        isOpen={showTerms}
                        onClose={() => setShowTerms(false)}
                        role={form.role}
                    />

                    <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
                        >
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
