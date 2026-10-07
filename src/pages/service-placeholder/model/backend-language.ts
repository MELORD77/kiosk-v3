import type { CitizenServiceLanguage } from '@/entities/citizen-service';
import type { ApiServerMessage } from '@/shared/api';
import { toUzbekUiText } from '@/shared/lib/i18n';

export function backendLanguage(language: string): CitizenServiceLanguage {
  if (language === 'uzc') return 'cr';
  if (language === 'ru' || language === 'en' || language === 'kk')
    return language;
  return 'uz';
}

export function localizedServerMessage(
  message: ApiServerMessage | undefined,
  language: string,
): string | undefined {
  if (typeof message === 'string' && /^errors\./i.test(message))
    return undefined;
  const text =
    typeof message === 'string'
      ? message
      : message?.[backendLanguage(language)];
  return text && language === 'uz' ? toUzbekUiText(text) : text;
}
