import { useTranslation } from 'react-i18next';
import type { ResultField } from '../model/service-result-values';
import { cn } from '@/shared/lib/classnames';

interface ResultFieldListProps {
  fields: ResultField[];
  columns?: 2 | 4;
}

export function ResultFieldList({ fields, columns = 2 }: ResultFieldListProps) {
  const { t } = useTranslation();
  return (
    <dl
      className={cn(
        'grid gap-x-kiosk-4 gap-y-kiosk-3 compact:grid-cols-1 [&_dt]:text-kiosk-description [&_dt]:text-kiosk-text-muted [&_dd]:text-kiosk-description [&_dd]:font-bold [&_dd]:whitespace-pre-line [&_dd]:wrap-anywhere',
        columns === 4 ? 'grid-cols-4 medium:grid-cols-2' : 'grid-cols-2',
      )}
    >
      {fields.map(({ label, value }) => (
        <div key={label} className="min-w-0 grid gap-kiosk-1">
          <dt>{t(`serviceResult.${label}`)}</dt>
          <dd>{value?.trim() || t('serviceResult.notProvided')}</dd>
        </div>
      ))}
    </dl>
  );
}
