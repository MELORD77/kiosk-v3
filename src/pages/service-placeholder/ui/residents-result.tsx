import { useTranslation } from 'react-i18next';
import type { Residents } from '@/entities/citizen-service';
import { ResultFieldList } from './result-field-list';
import { ResultSection } from './result-section';
import { ResidentsTable } from './residents-table';

interface ResidentsResultProps {
  data: Residents;
}

export function ResidentsResult({ data }: ResidentsResultProps) {
  const { t } = useTranslation();
  const groups = [
    {
      title: 'permanentResidents',
      residents: data.permanent,
      temporary: false,
    },
    { title: 'temporaryResidents', residents: data.temporary, temporary: true },
  ];
  return (
    <>
      <ResultSection
        title={t('serviceResult.address')}
        className="col-span-full"
        icon="document"
        tone="warning"
      >
        <ResultFieldList
          fields={[
            { label: 'address', value: data.address },
            { label: 'cadaster', value: data.cadaster },
          ]}
        />
      </ResultSection>
      {groups.map(({ title, residents, temporary }) => (
        <ResultSection
          key={title}
          title={t(`serviceResult.${title}`)}
          count={residents.length}
          className="col-span-full"
          icon="id-card"
          tone={temporary ? 'primary' : 'success'}
        >
          {residents.length === 0 ? (
            <p className="text-kiosk-description text-kiosk-text-muted">
              {t('serviceResult.noResidents')}
            </p>
          ) : (
            <ResidentsTable
              residents={residents}
              temporary={temporary}
              title={t(`serviceResult.${title}`)}
            />
          )}
        </ResultSection>
      ))}
    </>
  );
}
