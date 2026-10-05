import { z } from 'zod';

export const serviceLanguageSchema = z.object({
  uz: z.string(),
  cr: z.string(),
  ru: z.string(),
  en: z.string(),
});

export const serviceIdSchema = z.uuid();

export const serviceStatusSchema = z.enum([
  'ACTIVE',
  'IN_PROGRESS',
  'MAINTENANCE',
]);

export const serviceCategorySchema = z.object({
  key: z.string(),
  lang: serviceLanguageSchema,
  servicesCount: z.number().int(),
});

export const serviceSchema = z.object({
  id: serviceIdSchema,
  number: z.number().int(),
  category: z.string(),
  status: serviceStatusSchema,
  lang: serviceLanguageSchema,
});

export const serviceFormSchema = z.enum(['TRADITIONAL', 'ELECTRONIC']);

export const servicePriceSchema = z.object({
  isFree: z.boolean(),
  uzs: z.number().nonnegative(),
  bhm: z.number().nonnegative(),
  text: serviceLanguageSchema,
  bhmText: serviceLanguageSchema.nullable(),
});

export const serviceDetailSchema = serviceSchema.extend({
  department: serviceLanguageSchema.nullish(),
  forms: z.array(serviceFormSchema).optional(),
  result: serviceLanguageSchema.nullish(),
  price: servicePriceSchema.nullish(),
  documents: serviceLanguageSchema.nullish(),
  verification: serviceLanguageSchema.nullish(),
});

export type ServiceLanguage = z.infer<typeof serviceLanguageSchema>;
export type ServiceCategory = z.infer<typeof serviceCategorySchema>;
export type ServiceSummary = z.infer<typeof serviceSchema>;
export type ServiceStatus = z.infer<typeof serviceStatusSchema>;
export type ServiceForm = z.infer<typeof serviceFormSchema>;
export type ServicePrice = z.infer<typeof servicePriceSchema>;
export type ServiceDetail = z.infer<typeof serviceDetailSchema>;

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
