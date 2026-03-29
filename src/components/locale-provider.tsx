'use client';

import { useAppStore, Locale } from '@/stores/app-store';
import { useEffect, useSyncExternalStore, useCallback } from 'react';
import arTranslations from '@/locales/ar/common.json';
import enTranslations from '@/locales/en/common.json';
import frTranslations from '@/locales/fr/common.json';

const translations: Record<Locale, Record<string, unknown>> = {
  ar: arTranslations,
  en: enTranslations,
  fr: frTranslations,
};

const emptySubscribe = () => () => {};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useAppStore((state) => state.locale);
  
  // Use useSyncExternalStore to detect if we're on the client
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }
  }, [locale, mounted]);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

export function useTranslation() {
  const locale = useAppStore((state) => state.locale);
  const t = translations[locale];

  const getNestedValue = useCallback((obj: Record<string, unknown>, path: string): string => {
    const keys = path.split('.');
    let current: unknown = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }
    
    return typeof current === 'string' ? current : path;
  }, []);

  return {
    t: (key: string) => getNestedValue(t, key),
    locale,
  };
}
