import uz from './locales/uz.json';
import kk from './locales/kk.json';
import { toUzbekUiText } from './uzbek-ui-text';

function normalizeCatalogText(text: string): string {
  return toUzbekUiText(text.normalize('NFC'))
    .replace(/['‘’ʻʼ`]/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
}

function catalogEntries(
  source: Readonly<Record<string, string>>,
  translated: Readonly<Record<string, string>>,
): Array<readonly [string, string]> {
  return Object.entries(source).flatMap(([key, text]) => {
    const translation = translated[key];
    return translation
      ? [[normalizeCatalogText(text), translation] as const]
      : [];
  });
}

const catalogTranslations = new Map<string, string>([
  ...catalogEntries(uz.services, kk.services),
  ...catalogEntries(uz.categories, kk.categories),
]);

export function toKarakalpakCatalogText(text: string): string | undefined {
  return catalogTranslations.get(normalizeCatalogText(text));
}
