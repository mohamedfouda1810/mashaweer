// ============================================================================
// Mashaweer — useTranslation Hook
// React hook for consuming the i18n system with reactive locale updates
// ============================================================================

'use client';

import { useEffect, useCallback, useSyncExternalStore } from 'react';
import { translations, type Locale, type TranslationKey } from '@/lib/i18n';

// ─── External Store for Locale ──────────────────────────────────────────────
// This allows all components using the hook to react to locale changes
// without requiring a Context Provider (simpler architecture).

let currentLocale: Locale = 'ar';
const listeners = new Set<() => void>();

function getSnapshot(): Locale {
  return currentLocale;
}

function getServerSnapshot(): Locale {
  return 'ar';
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

/**
 * Initialize locale from localStorage on first load.
 * Called once when the module is first imported on the client.
 */
if (typeof window !== 'undefined') {
  const stored = window.localStorage.getItem('mashaweer-locale') as Locale | null;
  currentLocale = stored || 'ar';
}

/**
 * Set the locale globally and persist it.
 * Updates <html> dir and lang attributes.
 * Notifies all subscribed components to re-render.
 */
export function setLocale(locale: Locale) {
  if (locale === currentLocale) return;
  currentLocale = locale;
  
  // Persist
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('mashaweer-locale', locale);
    
    // Update <html> attributes
    const html = document.documentElement;
    html.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', locale);
    
    // Update document title direction hint
    document.title = document.title; // Force re-render of title
  }
  
  // Notify all subscribed components
  notifyListeners();
}

// ─── The Hook ───────────────────────────────────────────────────────────────

export function useTranslation() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', locale);
  }, [locale]);

  /**
   * Translate a key to the current locale.
   */
  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key];
      if (!entry) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Missing translation: "${key}"`);
        }
        return key as string;
      }
      return entry[locale] || entry.en || (key as string);
    },
    [locale]
  );

  /**
   * Toggle between Arabic and English.
   */
  const toggleLocale = useCallback(() => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  }, [locale]);

  /**
   * Check if current locale is RTL.
   */
  const isRTL = locale === 'ar';

  /**
   * Get the direction string.
   */
  const dir = isRTL ? 'rtl' : 'ltr';

  /**
   * Format a date according to the current locale.
   */
  const formatDate = useCallback(
    (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const defaultOpts: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        ...options,
      };
      return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-EG', defaultOpts);
    },
    [locale]
  );

  /**
   * Format a time according to the current locale.
   */
  const formatTime = useCallback(
    (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const defaultOpts: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...options,
      };
      return d.toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-EG', defaultOpts);
    },
    [locale]
  );

  /**
   * Format a number according to the current locale.
   */
  const formatNumber = useCallback(
    (num: number, options?: Intl.NumberFormatOptions): string => {
      return num.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-EG', options);
    },
    [locale]
  );

  return {
    t,
    locale,
    setLocale,
    toggleLocale,
    isRTL,
    dir,
    formatDate,
    formatTime,
    formatNumber,
  };
}
