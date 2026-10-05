import {
  localizedCatalogName,
  type ServicePrice,
} from '@/entities/service-catalog';

export function formatServicePrice(
  price: ServicePrice | null | undefined,
  language: string,
  freeLabel: string,
  fallback: string,
): string {
  if (!price) return fallback;
  if (price.isFree) return freeLabel;

  const text = localizedCatalogName(price.text, language);
  const bhmText = price.bhmText
    ? localizedCatalogName(price.bhmText, language)
    : '';
  const hasText = text.trim().length > 0;
  const hasBhmText = bhmText.trim().length > 0;

  if (hasText && hasBhmText) return `${text} (${bhmText})`;
  if (hasText) return text;
  if (hasBhmText) return bhmText;
  return fallback;
}
