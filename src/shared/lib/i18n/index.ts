import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { readPreference, writePreference } from '@/shared/lib/storage';
import uz from './locales/uz.json';
import uzc from './locales/uzc.json';
import ru from './locales/ru.json';
import en from './locales/en.json';
import kk from './locales/kk.json';

export { toUzbekUiText } from './uzbek-ui-text';
export { toKarakalpakCatalogText } from './karakalpak-catalog-text';

export const languages = [
  { code: 'uz', label: 'Özbekça', shortLabel: 'UZ', htmlLang: 'uz-Latn' },
  { code: 'uzc', label: 'Ўзбекча', shortLabel: 'ЎЗ', htmlLang: 'uz-Cyrl' },
  {
    code: 'kk',
    label: 'Qaraqalpaqsha',
    shortLabel: 'QQ',
    htmlLang: 'kaa-Latn',
  },
  { code: 'ru', label: 'Русский', shortLabel: 'RU', htmlLang: 'ru' },
  { code: 'en', label: 'English', shortLabel: 'EN', htmlLang: 'en' },
] as const;

export type Language = (typeof languages)[number]['code'];

export function isLanguage(value: string): value is Language {
  return languages.some((language) => language.code === value);
}

const savedLanguage = readPreference('kiosk-language');
export const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    uzc: { translation: uzc },
    ru: { translation: ru },
    en: { translation: en },
    kk: { translation: kk },
  },
  lng: savedLanguage && isLanguage(savedLanguage) ? savedLanguage : 'uz',
  fallbackLng: 'uz',
  supportedLngs: languages.map((language) => language.code),
  interpolation: { escapeValue: false },
  initAsync: false,
});

function syncLanguage(language: string) {
  const option = languages.find((item) => item.code === language);
  if (!option) return;
  document.documentElement.lang = option.htmlLang;
  writePreference('kiosk-language', option.code);
}

syncLanguage(i18n.language);
i18n.on('languageChanged', syncLanguage);
