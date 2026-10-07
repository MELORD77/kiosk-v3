import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CriminalRecord, Release } from '@/entities/citizen-service';
import { Button } from '@/shared/ui/button';
import {
  formatResultDate,
  primitiveDetails,
} from '../model/service-result-values';
import { ResultFieldList } from './result-field-list';
import { ResultSection } from './result-section';

interface CitizenRecordCardProps {
  record: CriminalRecord['records'][number] | Release['records'][number];
  index: number;
}

export function CitizenRecordCard({ record, index }: CitizenRecordCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const articles = primitiveDetails(record.articles);
  const court = 'court' in record ? record.court : null;
  const measures =
    'additionalMeasures' in record
      ? primitiveDetails(record.additionalMeasures)
      : [];
  const hasAdditionalInfo =
    'additionalInfo' in record &&
    record.additionalInfo !== null &&
    Object.keys(record.additionalInfo).length > 0;
  return (
    <ResultSection
      title={t('serviceResult.recordNumber', { number: index + 1 })}
      className="col-span-full"
      icon="document"
      tone="primary"
    >
      <ResultFieldList
        columns={4}
        fields={[
          { label: 'crimeCaseNum', value: record.crimeCaseNum },
          {
            label: 'convictedDate',
            value: formatResultDate(record.convictedDate),
          },
          { label: 'freedDate', value: formatResultDate(record.freedDate) },
          { label: 'freedBy', value: record.freedBy },
        ]}
      />
      <Button
        variant="secondary"
        className="min-h-kiosk-16 text-kiosk-description justify-self-start compact:w-full"
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={() => setExpanded((value) => !value)}
      >
        {t(
          expanded ? 'serviceResult.hideDetails' : 'serviceResult.showDetails',
        )}
      </Button>
      <div
        id={detailsId}
        hidden={!expanded}
        className={
          expanded
            ? 'grid gap-kiosk-4 border-t border-kiosk-border pt-kiosk-4'
            : 'hidden'
        }
      >
        <h4 className="text-kiosk-description font-bold">
          {t('serviceResult.term')}
        </h4>
        <ResultFieldList
          fields={[
            { label: 'years', value: record.term.years },
            { label: 'months', value: record.term.months },
            { label: 'days', value: record.term.days },
            { label: 'hours', value: record.term.hours },
          ]}
        />
        {court && (
          <>
            <h4 className="text-kiosk-description font-bold">
              {t('serviceResult.court')}
            </h4>
            <ResultFieldList
              fields={[
                { label: 'country', value: court.country },
                { label: 'region', value: court.region },
                { label: 'district', value: court.area },
                { label: 'organAddress', value: court.organAddress },
              ]}
            />
          </>
        )}
        {'arrestDate' in record && (
          <ResultFieldList
            fields={[
              {
                label: 'arrestDate',
                value: formatResultDate(record.arrestDate),
              },
              { label: 'note', value: record.note },
            ]}
          />
        )}
        <ResultFieldList
          fields={[{ label: 'articles', value: articles.join('\n') }]}
        />
        {articles.length !== record.articles.length && (
          <p className="text-kiosk-description text-kiosk-text-muted">
            {t('serviceResult.structuredDetailsUnavailable')}
          </p>
        )}
        {'additionalMeasures' in record && (
          <>
            <ResultFieldList
              fields={[
                { label: 'additionalMeasures', value: measures.join('\n') },
              ]}
            />
            {measures.length !== record.additionalMeasures.length && (
              <p className="text-kiosk-description text-kiosk-text-muted">
                {t('serviceResult.structuredDetailsUnavailable')}
              </p>
            )}
          </>
        )}
        {hasAdditionalInfo && (
          <p className="text-kiosk-description text-kiosk-text-muted">
            {t('serviceResult.additionalInfoUnavailable')}
          </p>
        )}
      </div>
    </ResultSection>
  );
}
