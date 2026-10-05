import { useTranslation } from 'react-i18next';
import { localizedCatalogName } from '@/entities/service-catalog';
import type {
  ServiceDetail,
  ServiceLanguage,
} from '@/entities/service-catalog';
import { Button } from '@/shared/ui/button';
import { ArrowIcon } from '@/shared/ui/arrow-icon';
import { ServiceFlowIcon } from './service-flow-icon';

import { formatServicePrice } from '../model/format-service-price';

interface ServiceOverviewProps {
  service: ServiceDetail;
  serviceName: string;
  onBack: () => void;
  onContinue: () => void;
}

function localizedDetail(
  value: ServiceLanguage | null | undefined,
  language: string,
  fallback: string,
) {
  return value
    ? localizedCatalogName(value, language).trim() || fallback
    : fallback;
}

export function ServiceOverview({
  service,
  serviceName,
  onBack,
  onContinue,
}: ServiceOverviewProps) {
  const { t, i18n } = useTranslation();
  const notProvided = t('serviceFlow.notProvided');
  const department = localizedDetail(
    service.department,
    i18n.language,
    notProvided,
  );
  const forms = service.forms?.length
    ? service.forms
        .map((form) =>
          t(
            `serviceFlow.${form === 'TRADITIONAL' ? 'traditional' : 'electronic'}`,
          ),
        )
        .join(', ')
    : notProvided;
  const requirements = [
    {
      label: 'serviceFlow.result',
      icon: 'document',
      value: localizedDetail(service.result, i18n.language, notProvided),
    },
    {
      label: 'serviceFlow.price',
      icon: 'coins',
      value: formatServicePrice(
        service.price,
        i18n.language,
        t('serviceFlow.free'),
        notProvided,
      ),
    },
    {
      label: 'serviceFlow.documents',
      icon: 'document',
      value: localizedDetail(service.documents, i18n.language, notProvided),
    },
    {
      label: 'serviceFlow.identityRequirement',
      icon: 'shield',
      value: localizedDetail(service.verification, i18n.language, notProvided),
    },
  ] as const;
  return (
    <section className="service-flow w-full max-w-[1440px] mx-auto flex flex-col short:gap-kiosk-4 gap-kiosk-4">
      <div className="flex items-center gap-kiosk-4 [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6">
        <Button variant="secondary" onClick={onBack}>
          <span className="flex rotate-180">
            <ArrowIcon />
          </span>
          {t('common.back')}
        </Button>
      </div>
      <div className="grid [&_h1]:font-extrabold [&_h1]:leading-[1.2] [&_p]:text-kiosk-text-muted min-w-0 gap-kiosk-2 [&_h1]:text-kiosk-2xl [&_h1]:wrap-anywhere [&_p]:text-kiosk-lg compact:[&_h1]:text-kiosk-xl compact:[&_p]:text-kiosk-md">
        <h1>{serviceName}</h1>
        <p>{t('serviceFlow.overviewTitle')}</p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start [[data-orientation='portrait']_&]:grid-cols-1 compact:grid-cols-1 gap-kiosk-4">
        <div className="bg-kiosk-surface border rounded-kiosk-md p-kiosk-6 grid gap-kiosk-4 min-w-0 border-kiosk-control-border shadow-kiosk-card compact:p-kiosk-4">
          <span className="flex items-center justify-center [&_svg]:w-full [&_svg]:h-full shrink-0 w-kiosk-12 h-kiosk-12 p-kiosk-3 rounded-kiosk-sm bg-kiosk-service-card-number text-kiosk-service-card-accent">
            <ServiceFlowIcon name="document" />
          </span>
          <div className="grid [&_h2]:text-kiosk-service-title [&_h2]:font-bold [&_p]:text-kiosk-text-muted [&_p]:leading-[1.5] min-w-0 gap-kiosk-4 [&_p]:text-kiosk-lg [&_p]:wrap-anywhere compact:[&_p]:text-kiosk-md">
            <dl className="grid gap-kiosk-4 [&_dt]:font-bold [&_dd]:text-kiosk-text-muted [&_dd]:leading-[1.5] min-w-0 [&_dt]:text-kiosk-lg [&_dt]:wrap-anywhere [&_dd]:text-kiosk-lg [&_dd]:whitespace-pre-line [&_dd]:wrap-anywhere compact:[&_dt]:text-kiosk-md compact:[&_dd]:text-kiosk-md">
              <div>
                <dt>{t('serviceFlow.department')}</dt>
                <dd>{department}</dd>
              </div>
              <div>
                <dt>{t('serviceFlow.forms')}</dt>
                <dd>{forms}</dd>
              </div>
            </dl>
            <p>{t('serviceFlow.conditionsNotice')}</p>
          </div>
        </div>
        <dl className="grid min-w-0 gap-kiosk-3">
          {requirements.map(({ label, icon, value }) => (
            <div
              key={label}
              className="flex items-center gap-kiosk-4 p-kiosk-4 border rounded-kiosk-md bg-kiosk-surface [&_dt]:font-bold [&_dd]:text-kiosk-text-muted min-w-0 border-kiosk-control-border [&_dt]:text-kiosk-lg [&_dt]:wrap-anywhere [&_dd]:text-kiosk-lg [&_dd]:leading-[1.5] [&_dd]:whitespace-pre-line [&_dd]:wrap-anywhere [&_>_div]:min-w-0 compact:gap-kiosk-3 compact:p-kiosk-3 compact:[&_dt]:text-kiosk-md compact:[&_dd]:text-kiosk-md"
            >
              <span className="flex items-center justify-center [&_svg]:w-full [&_svg]:h-full shrink-0 w-kiosk-12 h-kiosk-12 p-kiosk-3 rounded-kiosk-sm bg-kiosk-service-card-number text-kiosk-service-card-accent">
                <ServiceFlowIcon name={icon} />
              </span>
              <div>
                <dt>{t(label)}</dt>
                <dd>{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-wrap gap-kiosk-4 [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 justify-end [&_.button]:min-h-kiosk-16 [&_.button]:text-kiosk-lg">
        <Button
          className="w-80 max-w-full min-h-kiosk-16 text-kiosk-lg compact:w-full"
          onClick={onContinue}
        >
          {t('identity.continue')}
          <ArrowIcon />
        </Button>
      </div>
    </section>
  );
}
