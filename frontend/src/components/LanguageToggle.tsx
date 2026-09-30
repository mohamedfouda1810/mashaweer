'use client';

import { Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function LanguageToggle() {
    const { locale, setLocale } = useTranslation();

    const toggleLanguage = () => {
        setLocale(locale === 'ar' ? 'en' : 'ar');
    };

    return (
        <button
            type="button"
            onClick={toggleLanguage}
            className="group inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-slate-700 shadow-sm transition hover:border-emerald/40 hover:bg-emerald-50 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 active:scale-[0.98] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            title={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
            <Globe className="h-4 w-4 text-emerald-700 transition-transform duration-300 group-hover:rotate-12 dark:text-emerald-400" />
            <span className="text-sm font-semibold">
                {locale === 'ar' ? 'EN' : 'عربي'}
            </span>
        </button>
    );
}
