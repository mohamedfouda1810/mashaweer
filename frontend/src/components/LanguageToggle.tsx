'use client';

import { Languages } from 'lucide-react';
import { useEffect, useState } from 'react';

type Locale = 'ar' | 'en';

export function LanguageToggle() {
    const [locale, setLocale] = useState<Locale>(() => {
        if (typeof window === 'undefined') return 'ar';
        return window.localStorage.getItem('mashaweer-locale') === 'en' ? 'en' : 'ar';
    });

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        window.localStorage.setItem('mashaweer-locale', locale);
    }, [locale]);

    const toggle = () => {
        const next: Locale = locale === 'ar' ? 'en' : 'ar';
        setLocale(next);
        window.localStorage.setItem('mashaweer-locale', next);
        document.documentElement.lang = next;
        document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-md transition-all hover:border-mint/40 hover:bg-white hover:text-navy dark:border-white/10 dark:bg-white/5 dark:text-slate-light dark:hover:bg-white/10"
        >
            <Languages className="h-4 w-4 text-mint" />
            <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
        </button>
    );
}
