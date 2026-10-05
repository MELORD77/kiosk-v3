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
    status: 'ACTIVE' as const,
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

export const serviceDetail = {
  ...catalogServices[0],
  id: '615dc12d-f7c2-4639-8720-11e7d2cb9306',
  number: 1,
  category: 'mig',
  lang: {
    uz: 'O‘zbekiston Respublikasi hududida chet el fuqarolari va fuqaroligi bo‘lmagan shaxslarni vaqtincha turgan joyi bo‘yicha ro‘yxatga olish',
    cr: 'Ўзбекистон Республикаси ҳудудида чет эл фуқаролари ва фуқаролиги бўлмаган шахсларни вақтинча турган жойи бўйича рўйхатга олиш',
    ru: 'Регистрация иностранных граждан и лиц без гражданства по месту временного пребывания на территории Республики Узбекистан',
    en: 'Registration of foreign citizens and stateless persons at their place of temporary stay in Uzbekistan',
  },
  department: {
    uz: 'Migratsiya va personallashtirish departamenti',
    cr: 'Миграция ва персоналлаштириш департаменти',
    ru: 'Департамент миграции и персонализации',
    en: 'Department of Migration and Personalization',
  },
  forms: ['TRADITIONAL', 'ELECTRONIC'],
  result: {
    uz: 'Qayd varag‘i',
    cr: 'Қайд варағи',
    ru: 'Регистрационный листок',
    en: 'Registration slip',
  },
  price: {
    isFree: false,
    uzs: 8240,
    bhm: 0.02,
    text: {
      uz: '1 kun uchun 8 240 so‘m',
      cr: '1 кун учун 8 240 сўм',
      ru: '8 240 сум за 1 день',
      en: '8,240 UZS per day',
    },
    bhmText: {
      uz: '1 kun uchun 0,02 BHM',
      cr: '1 кун учун 0,02 БҲМ',
      ru: '0,02 БРВ за 1 день',
      en: '0.02 BCA per day',
    },
  },
  documents: null,
  verification: null,
};

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
