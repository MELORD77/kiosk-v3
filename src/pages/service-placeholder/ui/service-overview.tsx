import { useTranslation } from 'react-i18next';
import { localizedCatalogName } from '@/entities/service-catalog';
import type {
  ServiceDetail,
  ServiceLanguage,
} from '@/entities/service-catalog';
import { Button } from '@/shared/ui/button';
import { BackButton } from '@/shared/ui/back-button';
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
    <section className="service-flow w-full max-w-360 mx-auto flex flex-col short:gap-kiosk-4 gap-kiosk-4">
      <div className="flex items-center gap-kiosk-4 [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6">
        <BackButton onClick={onBack} />
      </div>
      <div className="grid [&_h3]:font-extrabold [&_h3]:leading-[1.2] [&_p]:text-kiosk-text-muted min-w-0 gap-kiosk-2 [&_h3]:text-kiosk-2xl [&_h3]:wrap-anywhere [&_p]:text-kiosk-lg compact:[&_h3]:text-kiosk-xl short-wide:[&_h3]:text-kiosk-xl compact:[&_p]:text-kiosk-description">
        <h3>{serviceName}</h3>
        <p>{t('serviceFlow.overviewTitle')}</p>
      </div>

      <div className="grid roomy:flex-1 roomy:content-center grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start [[data-orientation='portrait']_&]:grid-cols-1 compact:grid-cols-1 gap-kiosk-2">
        <div className="bg-kiosk-surface border rounded-kiosk-md p-kiosk-6 flex items-start gap-kiosk-4 min-w-0 border-kiosk-control-border shadow-kiosk-card compact:p-kiosk-2">
          <span className="flex items-center justify-center [&_svg]:w-full [&_svg]:h-full shrink-0 w-kiosk-12 h-kiosk-12 compact:hidden short-wide:hidden p-kiosk-3 rounded-kiosk-sm bg-kiosk-service-card-number text-kiosk-service-card-accent">
            <ServiceFlowIcon name="document" />
          </span>
          <div className="grid [&_h3]:text-kiosk-service-title [&_h3]:font-bold [&_p]:text-kiosk-text-muted [&_p]:leading-[1.3] min-w-0 gap-kiosk-4 [&_p]:text-kiosk-lg [&_p]:wrap-anywhere compact:[&_p]:text-kiosk-description">
            <dl className="grid gap-kiosk-4 compact:grid-cols-2 [&_dt]:font-bold [&_dd]:text-kiosk-text-muted [&_dd]:leading-[1.3] min-w-0 [&_dt]:text-kiosk-lg [&_dt]:wrap-anywhere [&_dd]:text-kiosk-lg [&_dd]:whitespace-pre-line [&_dd]:wrap-anywhere compact:[&_dt]:text-kiosk-description compact:[&_dd]:text-kiosk-description">
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
        <dl className="grid min-w-0 gap-kiosk-4 short-wide:grid-cols-2 compact:grid-cols-2">
          {requirements.map(({ label, icon, value }) => (
            <div
              key={label}
              className="flex items-center gap-kiosk-4 p-kiosk-6 border rounded-kiosk-md bg-kiosk-surface [&_dt]:font-bold [&_dd]:text-kiosk-text-muted min-w-0 border-kiosk-control-border [&_dt]:text-kiosk-lg [&_dt]:wrap-anywhere [&_dd]:text-kiosk-lg [&_dd]:leading-[1.3] [&_dd]:whitespace-pre-line [&_dd]:wrap-anywhere [&_>_div]:min-w-0 compact:gap-kiosk-3 compact:p-kiosk-2 compact:[&_dt]:text-kiosk-description compact:[&_dd]:text-kiosk-description"
            >
              <span className="flex items-center justify-center [&_svg]:w-full [&_svg]:h-full shrink-0 w-kiosk-12 h-kiosk-12 compact:hidden short-wide:hidden p-kiosk-3 rounded-kiosk-sm bg-kiosk-service-card-number text-kiosk-service-card-accent">
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
      <div className="mt-auto grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-kiosk-2 [[data-orientation='portrait']_&]:grid-cols-1 compact:grid-cols-1 [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 [&_.button]:min-h-kiosk-16 [&_.button]:text-kiosk-lg">
        <Button
          className="col-start-2 w-full min-h-kiosk-16 text-kiosk-lg [[data-orientation='portrait']_&]:col-start-1 compact:col-start-1"
          onClick={onContinue}
        >
          {t('identity.continue')}
          <ArrowIcon />
        </Button>
      </div>
    </section>
  );
}
