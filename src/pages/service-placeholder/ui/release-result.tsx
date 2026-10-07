import { useTranslation } from 'react-i18next';
import type { Release } from '@/entities/citizen-service';
import { StatusPanel } from '@/shared/ui/status-panel';
import { CitizenRecordCard } from './citizen-record-card';

interface ReleaseResultProps {
  data: Release;
}

export function ReleaseResult({ data }: ReleaseResultProps) {
  const { t } = useTranslation();
  if (!data.isReleased)
    return <StatusPanel tone="success" title={t('serviceResult.noReleases')} />;
  if (data.records.length === 0)
    return (
      <StatusPanel
        title={t('serviceResult.releaseFound')}
        description={t('serviceResult.recordsMissing')}
      />
    );
  return (
    <>
      <div className="col-span-full">
        <StatusPanel title={t('serviceResult.releaseFound')} />
      </div>
      {data.records.map((record, index) => (
        <CitizenRecordCard key={index} record={record} index={index} />
      ))}
    </>
  );
}
