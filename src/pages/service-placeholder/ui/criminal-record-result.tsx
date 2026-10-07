import { useTranslation } from 'react-i18next';
import type { CriminalRecord } from '@/entities/citizen-service';
import { StatusPanel } from '@/shared/ui/status-panel';
import { CitizenRecordCard } from './citizen-record-card';

interface CriminalRecordResultProps {
  data: CriminalRecord;
}

export function CriminalRecordResult({ data }: CriminalRecordResultProps) {
  const { t } = useTranslation();
  if (!data.isConvicted)
    return (
      <StatusPanel tone="success" title={t('serviceResult.noConvictions')} />
    );
  if (data.records.length === 0)
    return (
      <StatusPanel
        title={t('serviceResult.convictionFound')}
        description={t('serviceResult.recordsMissing')}
      />
    );
  return (
    <>
      <div className="col-span-full">
        <StatusPanel title={t('serviceResult.convictionFound')} />
      </div>
      {data.records.map((record, index) => (
        <CitizenRecordCard key={index} record={record} index={index} />
      ))}
    </>
  );
}
