import 'server-only';

const dictionaries = {
  ar: () => import('@/locales/ar/common.json').then((m) => m.default),
  fr: () => import('@/locales/fr/common.json').then((m) => m.default),
  en: () => import('@/locales/en/common.json').then((m) => m.default),
};

export type Locale = 'ar' | 'fr' | 'en';

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};

export const getLocales = (): Locale[] => ['ar', 'fr', 'en'];

export const isRTL = (locale: Locale): boolean => locale === 'ar';

export const getLocaleName = (locale: Locale): string => {
  const names: Record<Locale, string> = {
    ar: 'العربية',
    fr: 'Français',
    en: 'English',
  };
  return names[locale];
};
