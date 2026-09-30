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
            onClick={toggleLanguage}
            className="fixed bottom-20 left-4 z-50 flex h-10 items-center justify-center gap-2 rounded-full bg-white/70 px-4 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/90 hover:shadow-xl active:scale-95 dark:bg-zinc-800/70 dark:ring-white/10 dark:hover:bg-zinc-800/90 sm:bottom-6"
            title={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
            <Globe className="h-4 w-4 text-zinc-600 transition-transform duration-300 group-hover:rotate-12 dark:text-zinc-300" />
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                {locale === 'ar' ? 'EN 🇬🇧' : 'عربي 🇪🇬'}
            </span>
        </button>
    );
}
