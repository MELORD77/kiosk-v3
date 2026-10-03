import uz from '../../src/shared/lib/i18n/locales/uz.json' with { type: 'json' };
import uzc from '../../src/shared/lib/i18n/locales/uzc.json' with { type: 'json' };
import ru from '../../src/shared/lib/i18n/locales/ru.json' with { type: 'json' };
import en from '../../src/shared/lib/i18n/locales/en.json' with { type: 'json' };

const categoryKeys = [
  'mig',
  'reg',
  'cert',
  'road',
  'permit',
  'protect',
] as const;
const categoryByNumber = [
  'mig',
  'mig',
  'mig',
  'reg',
  'reg',
  'reg',
  'reg',
  'reg',
  'mig',
  'permit',
  'permit',
  'cert',
  'road',
  'road',
  'road',
  'road',
  'road',
  'road',
  'road',
  'road',
  'road',
  'cert',
  'protect',
  'permit',
];

const serviceNumbers = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24,
] as const;

export const catalogServices = serviceNumbers.map((number, index) => {
  const serviceKey = `service-${number}` as const;
  return {
    id: `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`,
    number,
    category: categoryByNumber[index],
    lang: {
      uz: uz.services[serviceKey],
      cr: uzc.services[serviceKey],
      ru: ru.services[serviceKey],
      en: en.services[serviceKey],
    },
  };
});

export const catalogCategories = categoryKeys.map((key) => ({
  key,
  lang: {
    uz: uz.categories[key],
    cr: uzc.categories[key],
    ru: ru.categories[key],
    en: en.categories[key],
  },
  servicesCount: catalogServices.filter((service) => service.category === key)
    .length,
}));

export function catalogEnvelope<T>(result: T) {
  return {
    message: 'Success',
    result,
    meta: null,
    time: '2026-10-02T10:19:59.186Z',
  };
}

export function catalogResponse(url: URL): Response {
  const path = url.pathname;
  if (path === '/api/v3/services/categories')
    return Response.json(catalogEnvelope(catalogCategories));
  if (path === '/api/v3/services') {
    const category = url.searchParams.get('category');
    return Response.json(
      catalogEnvelope(
        catalogServices.filter(
          (service) => !category || service.category === category,
        ),
      ),
    );
  }
  const service = catalogServices.find(
    (item) => path === `/api/v3/services/${item.id}`,
  );
  return service
    ? Response.json(catalogEnvelope(service))
    : Response.json(catalogEnvelope(null), { status: 404 });
}
