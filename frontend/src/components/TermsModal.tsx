'use client';

import React from 'react';
import { X, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: 'PASSENGER' | 'DRIVER';
}

const DRIVER_TERMS = [
    {
        title: 'الإقرار بالأهلية القانونية والمستندات',
        content: 'يقر السائق بأن جميع البيانات والمستندات المرفقة سارية وصحيحة، ويتحمل المسؤولية الجنائية. يلتزم بتحديث بياناته ويحق للمنصة حجب الحساب لانتهاء الصلاحية.',
    },
    {
        title: 'طبيعة العلاقة القانونية (بند عدم التبعية)',
        content: 'منصة "مشاوير" وسيط تقني فقط. السائق ليس موظفاً وهو المسؤول عن تكاليف التشغيل.',
    },
    {
        title: 'إخلاء المسؤولية التام',
        content: 'لا تتحمل المنصة مسؤولية الحوادث أو الأضرار. السائق مسؤول عن سلامة الركاب واتباع قواعد المرور.',
    },
    {
        title: 'سياسات الأمان والسلوك',
        content: 'يُمنع القيادة تحت تأثير مخدر أو استخدام الهاتف. يلتزم بالآداب العامة ويُحظر حمل مواد غير قانونية.',
    },
    {
        title: 'السياسة المالية وإلغاء الرحلات',
        content: 'يلتزم بالتحرك في الموعد (تأخير أقصاه 10 دقائق). يُمنع تحصيل مبالغ إضافية عن التسعيرة.',
    },
    {
        title: 'الخصوصية والأمان التقني',
        content: 'يوافق على مشاركة موقعه الجغرافي (GPS). يُحظر الاحتفاظ ببيانات الركاب لأغراض غير مهنية.',
    },
];

const PASSENGER_TERMS = [
    {
        title: 'الأهلية والاستخدام الشخصي',
        content: 'الحساب شخصي. يلتزم بتقديم بيانات صحيحة ويتحمل مسؤولية التلاعب.',
    },
    {
        title: 'الالتزام بالمواعيد ونقطة الالتقاء',
        content: 'التواجد قبل الموعد بـ 20 دقيقة. بعد 10 دقائق تأخير، يحق للسائق التحرك ولا يسترد الراكب القيمة.',
    },
    {
        title: 'قواعد السلوك والأمان',
        content: 'الالتزام بالآداب، يُمنع التدخين والمخدرات. الحفاظ على نظافة السيارة وتحمل تكلفة التلفيات. عدم حمل مواد خطرة.',
    },
    {
        title: 'إخلاء المسؤولية القانونية',
        content: 'المنصة وسيط تقني. يبرئ الراكب ذمة المنصة من الحوادث والمفقودات. أي خلاف مع السائق هو خلاف مدني.',
    },
    {
        title: 'سياسة الإلغاء والدفع',
        content: 'الإلغاء قبل الرحلة بـ 60 دقيقة. يلتزم بدفع القيمة المحددة في التطبيق ويُحظر التفاوض مع السائق.',
    },
    {
        title: 'الخصوصية والتقييم',
        content: 'يوافق على مشاركة موقعه. يلتزم بعدم استخدام بيانات السائق خارج الرحلة. التقييم الكاذب يعرض للمساءلة.',
    },
];

export function TermsModal({ isOpen, onClose, role }: TermsModalProps) {
    const { t, locale } = useTranslation();

    if (!isOpen) return null;

    const terms = role === 'DRIVER' ? DRIVER_TERMS : PASSENGER_TERMS;
    const title = role === 'DRIVER' ? t('terms.driverTitle') : t('terms.passengerTitle');

    return (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/50 p-4 backdrop-blur-md" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="animate-scale-in relative max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white/90 shadow-2xl backdrop-blur-xl border border-white/20 dark:bg-navy-950/90 dark:border-white/10 flex flex-col">
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between border-b border-black/5 bg-navy/95 px-6 py-4 backdrop-blur-md dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 border border-white/10">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{title}</h2>
                            <p className="text-xs text-white/70">{t('terms.subtitle')}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5" dir="rtl">
                    <div className="space-y-4">
                        {terms.map((term, index) => (
                            <div
                                key={index}
                                className="rounded-xl border border-black/5 bg-white/50 p-4 dark:border-white/5 dark:bg-black/20"
                            >
                                <div className="mb-2 flex items-start gap-3">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-xs font-bold text-navy-700 dark:bg-white/10 dark:text-navy-300">
                                        {index + 1}
                                    </span>
                                    <h3 className="text-sm font-bold text-navy-900 dark:text-white">
                                        {term.title}
                                    </h3>
                                </div>
                                <p className="mr-10 text-sm leading-7 text-navy-700 dark:text-navy-300">
                                    {term.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-black/5 bg-white/50 px-6 py-4 backdrop-blur-md dark:border-white/5 dark:bg-black/20">
                    <button
                        onClick={onClose}
                        className="btn-3d w-full rounded-xl bg-gradient-to-r from-navy to-emerald py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                        {t('terms.agree')}
                    </button>
                </div>
            </div>
        </div>
    );
}
