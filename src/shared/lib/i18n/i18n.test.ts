import { describe, expect, it } from 'vitest';
import uz from './locales/uz.json';
import uzc from './locales/uzc.json';
import ru from './locales/ru.json';
import en from './locales/en.json';
import kk from './locales/kk.json';
import { toUzbekUiText } from './uzbek-ui-text';
import { toKarakalpakCatalogText } from './karakalpak-catalog-text';

function textEntries(value: unknown, path = ''): Array<[string, string]> {
  if (typeof value === 'string') return [[path, value]];
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, item]) =>
    textEntries(item, path ? `${path}.${key}` : key),
  );
}

describe('locale resources', () => {
  const sourceEntries = textEntries(uz);

  it.each([
    ['uzc', uzc],
    ['ru', ru],
    ['en', en],
    ['kk', kk],
  ])(
    '%s contains every key and preserves interpolation variables',
    (_, locale) => {
      const entries = textEntries(locale);
      expect(entries.map(([key]) => key).sort()).toEqual(
        sourceEntries.map(([key]) => key).sort(),
      );
      const translations = new Map(entries);
      for (const [key, source] of sourceEntries) {
        const text = translations.get(key);
        expect(text?.trim(), key).toBeTruthy();
        expect(text?.match(/\{\{[^}]+\}\}/g)?.sort() ?? [], key).toEqual(
          source.match(/\{\{[^}]+\}\}/g)?.sort() ?? [],
        );
      }
    },
  );

  it('preserves native language names and greetings', () => {
    expect(uz.languages.en).toBe('English');
    expect(uz.languages.kk).toBe('Qaraqalpaqsha');
    expect(uz.welcome.kk).toBe('Xosh kelipsiz');
    expect(kk.languages.uz).toBe('Özbekça');
    expect(kk.welcome.uz).toBe('Xuş kelibsiz');
    expect(JSON.stringify(kk)).not.toContain('\u00ad');
  });
});

describe('Uzbek UI orthography', () => {
  it('converts all four letters in mixed and uppercase text', () => {
    expect(toUzbekUiText('Shaxs CHET O‘zbekiston G‘alaba yashash')).toBe(
      'Şaxs ÇET Özbekiston Ğalaba yaşaş',
    );
  });

  it('accepts apostrophe variants and preserves tutuq marks', () => {
    for (const apostrophe of ["'", '‘', '’', 'ʻ', 'ʼ', '`']) {
      expect(
        toUzbekUiText(
          `o${apostrophe} g${apostrophe} O${apostrophe} G${apostrophe}`,
        ),
      ).toBe('ö ğ Ö Ğ');
    }
    expect(toUzbekUiText('ma’lumot ta’lim')).toBe('ma’lumot ta’lim');
  });

  it('converts the Uzbek identity acronym and preserves protocols and placeholders', () => {
    expect(
      toUzbekUiText('JSHSHIR HTTP HTTPS MRZ PINFL NFC ID {{shaxs}} {{count}}'),
    ).toBe('JŞŞIR HTTP HTTPS MRZ PINFL NFC ID {{shaxs}} {{count}}');
    expect(toUzbekUiText('Özbekça Xuş kelibsiz')).toBe('Özbekça Xuş kelibsiz');
  });

  it('uses the approved alphabet in every Uzbek UI resource', () => {
    const foreignNativeText = /^(?:languages|welcome)\.(?:en|kk|ru|uzc)$/;
    for (const [key, value] of textEntries(uz)) {
      if (foreignNativeText.test(key)) continue;
      const visibleText = value.replace(/\{\{[^}]*\}\}/g, '');
      expect(visibleText, key).not.toMatch(/sh|ch|[og]['‘’ʻʼ`]/i);
    }
    expect(uz.identity.pinMethod).toBe('JŞŞIR');
    expect(uz.serviceFlow.manualDescription).toContain('JŞŞIR');
  });
});

describe('Karakalpak catalog presentation', () => {
  it('recognizes known old and new Uzbek service names', () => {
    expect(
      toKarakalpakCatalogText('Yashash joyi bo‘yicha ma’lumotnoma berish'),
    ).toBe(kk.services['service-7']);
    expect(
      toKarakalpakCatalogText("  Yashash  joyi bo'yicha ma'lumotnoma berish  "),
    ).toBe(kk.services['service-7']);
    expect(toKarakalpakCatalogText(uz.services['service-7'])).toBe(
      kk.services['service-7'],
    );
    expect(toKarakalpakCatalogText('Ma’lumotnomalar')).toBe(kk.categories.cert);
  });

  it('matches normalized Unicode and leaves unknown names untranslated', () => {
    expect(
      toKarakalpakCatalogText(uz.services['service-4'].normalize('NFD')),
    ).toBe(kk.services['service-4']);
    expect(toKarakalpakCatalogText('Yangi server xizmati')).toBeUndefined();
    expect(toKarakalpakCatalogText('')).toBeUndefined();
  });
});
