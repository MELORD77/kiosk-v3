import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import {
  localizedCatalogName,
  type ServiceSummary,
} from '@/entities/service-catalog';
import { Button } from '@/shared/ui/button';
import { ArrowIcon } from '@/shared/ui/arrow-icon';
import { Badge } from '@/shared/ui/badge';

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
  const { i18n } = useTranslation();
  return (
    <Button
      variant="secondary"
      className={styles['service-card']}
      onClick={onSelect}
    >
      <span className={styles['service-card-top']} aria-hidden="true">
        <span className={styles['service-card-meta']}>
          <Badge tone="primary" className={styles['service-number']}>
            {String(service.number).padStart(2, '0')}
          </Badge>
          {categoryName && (
            <span className={styles['service-category']}>{categoryName}</span>
          )}
        </span>
        <span className={styles['service-card-arrow']}>
          <ArrowIcon />
        </span>
      </span>
      <span className={styles['service-card-title']}>
        {localizedCatalogName(service.lang, i18n.language)}
      </span>
    </Button>
  );
}
