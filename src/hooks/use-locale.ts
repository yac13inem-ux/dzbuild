'use client';

import { useAppStore, Locale } from '@/stores/app-store';
import { isRTL, getLocaleName } from '@/lib/i18n';

export const useLocale = () => {
  const locale = useAppStore((state) => state.locale);
  const setLocale = useAppStore((state) => state.setLocale);
  
  return {
    locale,
    setLocale,
    isRTL: isRTL(locale),
    localeName: getLocaleName(locale),
    dir: isRTL(locale) ? 'rtl' : 'ltr',
  };
};

export const useTranslation = () => {
  const locale = useAppStore((state) => state.locale);
  
  // This is a simplified translation function
  // In production, you'd load translations from the JSON files
  const t = (key: string): string => {
    // Return the key for now - actual translations are loaded client-side
    return key;
  };
  
  return { t, locale };
};
