import { describe, expect, it } from 'vitest';
import { backendLanguage, localizedServerMessage } from './backend-language';

describe('backend language compatibility', () => {
  it('uses the confirmed Karakalpak language and Cyrillic contract codes', () => {
    expect(backendLanguage('kk')).toBe('kk');
    expect(backendLanguage('uzc')).toBe('cr');
  });

  it('presents Uzbek server messages with the selected spelling', () => {
    const message = {
      uz: 'Shaxs topilmadi',
      cr: 'Шахс топилмади',
      ru: 'Лицо не найдено',
      en: 'Check failed',
      kk: 'Tekseriw sátsiz boldı',
    };
    expect(localizedServerMessage(message, 'uz')).toBe('Şaxs topilmadi');
    expect(localizedServerMessage(undefined, 'kk')).toBeUndefined();
    expect(localizedServerMessage(message, 'en')).toBe('Check failed');
    expect(localizedServerMessage(message, 'kk')).toBe('Tekseriw sátsiz boldı');
  });

  it('falls back for internal error keys while preserving human-readable messages', () => {
    expect(
      localizedServerMessage('errors.internalServerError', 'en'),
    ).toBeUndefined();
    expect(localizedServerMessage('Unavailable', 'en')).toBe('Unavailable');
  });
});
