import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { localizedCatalogName, type ServiceLanguage } from './service-catalog';

const names: ServiceLanguage = {
  uz: 'Yashash joyi bo‘yicha ma’lumotnoma berish',
  cr: 'Кирилл',
  ru: 'Русский',
  en: 'English',
};

describe('catalog presentation languages', () => {
  it('converts old backend Uzbek spelling without mutating the response', () => {
    expect(localizedCatalogName(names, 'uz')).toBe(
      'Yaşaş joyi böyiça ma’lumotnoma beriş',
    );
    expect(names.uz).toBe('Yashash joyi bo‘yicha ma’lumotnoma berish');
  });

  it('translates recognized backend service and category names into Karakalpak', () => {
    expect(localizedCatalogName(names, 'kk')).toBe(
      i18n.t('services.service-7', { lng: 'kk' }),
    );
    expect(
      localizedCatalogName({ ...names, uz: 'Ro‘yxatga olish' }, 'kk'),
    ).toBe(i18n.t('categories.reg', { lng: 'kk' }));
  });

  it('preserves an unknown backend name instead of replacing it with a static service', () => {
    expect(localizedCatalogName({ ...names, uz: 'Yangi xizmat' }, 'kk')).toBe(
      'Yangi xizmat',
    );
  });

  it.each([
    ['uzc', names.cr],
    ['ru', names.ru],
    ['en', names.en],
  ])('preserves backend text for %s', (language, expected) => {
    expect(localizedCatalogName(names, language)).toBe(expected);
  });
});
