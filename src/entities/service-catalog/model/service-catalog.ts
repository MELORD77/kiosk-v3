import { z } from 'zod';

export const serviceLanguageSchema = z.object({
  uz: z.string(),
  cr: z.string(),
  ru: z.string(),
  en: z.string(),
});

export const serviceIdSchema = z.uuid();

export const serviceCategorySchema = z.object({
  key: z.string(),
  lang: serviceLanguageSchema,
  servicesCount: z.number().int(),
});

export const serviceSchema = z.object({
  id: serviceIdSchema,
  number: z.number().int(),
  category: z.string(),
  lang: serviceLanguageSchema,
});

export type ServiceLanguage = z.infer<typeof serviceLanguageSchema>;
export type ServiceCategory = z.infer<typeof serviceCategorySchema>;
export type ServiceSummary = z.infer<typeof serviceSchema>;

export function localizedCatalogName(
  lang: ServiceLanguage,
  language: string,
): string {
  switch (language) {
    case 'uzc':
    case 'cr':
      return lang.cr;
    case 'ru':
      return lang.ru;
    case 'en':
      return lang.en;
    default:
      return lang.uz;
  }
}
