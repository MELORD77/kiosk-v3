import type { Language } from '@/shared/lib/i18n';
import uzbekistan from '../assets/uzbekistan.svg';
import karakalpakstan from '../assets/karakalpakstan.svg';
import russia from '../assets/russia.svg';
import unitedKingdom from '../assets/united-kingdom.svg';

const flags: Record<Language, string> = {
  uz: uzbekistan,
  uzc: uzbekistan,
  kk: karakalpakstan,
  ru: russia,
  en: unitedKingdom,
};

interface LanguageFlagProps {
  language: Language;
}

export function LanguageFlag({ language }: LanguageFlagProps) {
  return (
    <span
      aria-hidden="true"
      className="language-flag block h-kiosk-16 w-kiosk-16 shrink-0 overflow-hidden rounded-full border-2 border-kiosk-border-strong bg-kiosk-surface p-1 compact:h-kiosk-12 compact:w-kiosk-12"
    >
      <img
        src={flags[language]}
        alt=""
        width={64}
        height={64}
        className="block h-full w-full rounded-full object-cover object-left"
      />
    </span>
  );
}
