import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  localizedCatalogName,
  type ServiceStatus,
  type ServiceSummary,
} from '@/entities/service-catalog';
import { Button } from '@/shared/ui/button';
import { ArrowIcon } from '@/shared/ui/arrow-icon';
import { Badge } from '@/shared/ui/badge';

const statusTones: Record<ServiceStatus, 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  IN_PROGRESS: 'warning',
  MAINTENANCE: 'danger',
};

interface ServiceCardProps {
  service: ServiceSummary;
  categoryName?: string;
  onSelect: () => void;
}

export function ServiceCard({
  service,
  categoryName,
  onSelect,
}: ServiceCardProps) {
  const { t, i18n } = useTranslation();
  const statusId = useId();
  const isAvailable = service.status === 'ACTIVE';
  const serviceName = localizedCatalogName(service.lang, i18n.language);
  return (
    <Button
      variant="secondary"
      className="service-card flex items-stretch justify-start flex-col text-left gap-kiosk-3 p-kiosk-4 min-h-[136px] h-auto self-stretch rounded-kiosk-md border border-solid border-kiosk-border shadow-kiosk-card [[data-orientation='portrait']_&]:min-h-[192px] medium:min-h-[136px] compact:min-h-[136px] compact:[[data-orientation='portrait']_&]:min-h-[136px] bg-none [&:disabled:hover]:bg-kiosk-surface [&[data-service-status='ACTIVE']]:border-kiosk-service-card-border [&:enabled:hover]:border-kiosk-service-card-accent [&:disabled:not([data-service-status='MAINTENANCE'])]:opacity-60! [&[data-service-status='MAINTENANCE']]:opacity-100!"
      data-service-status={service.status}
      disabled={!isAvailable}
      aria-label={serviceName}
      aria-describedby={statusId}
      onClick={onSelect}
    >
      <span className="service-card-top flex items-center justify-between gap-kiosk-3 shrink-0">
        <span className="service-card-meta flex items-center min-w-0 gap-kiosk-2">
          <Badge
            tone="primary"
            className="service-number py-kiosk-1 px-kiosk-2 min-w-[44px] min-h-[36px] grid place-items-center flex-none text-kiosk-md font-extrabold bg-kiosk-service-card-number text-kiosk-service-card-accent"
          >
            {String(service.number).padStart(2, '0')}
          </Badge>
          {categoryName && (
            <span className="service-category text-kiosk-text-muted text-kiosk-description font-semibold leading-[1.2] min-w-0 wrap-anywhere">
              {categoryName}
            </span>
          )}
        </span>
      </span>
      <span className="service-card-body flex items-center gap-kiosk-3 min-w-0 flex-1">
        <span className="service-card-title text-kiosk-service-title font-bold leading-[1.3] min-w-0 flex-1 wrap-anywhere [[data-orientation='portrait']_&]:text-kiosk-service-title">
          {serviceName}
        </span>
        {isAvailable && (
          <span
            className="service-card-arrow w-kiosk-8 h-kiosk-8 text-kiosk-service-card-accent flex-none grid place-items-center [&_svg]:w-full [&_svg]:h-full"
            aria-hidden="true"
          >
            <ArrowIcon />
          </span>
        )}
      </span>
      <Badge
        id={statusId}
        tone={statusTones[service.status]}
        className="service-status self-start mt-auto gap-kiosk-2 text-kiosk-sm font-semibold text-left whitespace-normal wrap-anywhere"
      >
        <span
          className="service-status-dot w-kiosk-2 h-kiosk-2 rounded-full bg-current flex-none"
          aria-hidden="true"
        />
        {t(`serviceStatus.${service.status}`)}
      </Badge>
    </Button>
  );
}
