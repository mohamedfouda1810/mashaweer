'use client';

import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

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
    if (!isOpen) return null;

    const terms = role === 'DRIVER' ? DRIVER_TERMS : PASSENGER_TERMS;
    const title = role === 'DRIVER' ? 'سياسات السائق' : 'سياسات الراكب';

    return (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="animate-scale-in relative max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-gradient-to-r from-navy to-navy-light px-6 py-4 dark:border-zinc-700">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{title}</h2>
                            <p className="text-xs text-white/70">الشروط والأحكام</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto px-6 py-5" dir="rtl">
                    <div className="space-y-4">
                        {terms.map((term, index) => (
                            <div
                                key={index}
                                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <div className="mb-2 flex items-start gap-3">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy text-xs font-bold text-white">
                                        {index + 1}
                                    </span>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                        {term.title}
                                    </h3>
                                </div>
                                <p className="mr-10 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                                    {term.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-900">
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white transition-all hover:bg-navy-light active:scale-[0.98]"
                    >
                        فهمت وموافق
                    </button>
                </div>
            </div>
        </div>
    );
}
