import { useTranslation } from 'react-i18next';
import type { Residence } from '@/entities/citizen-service';
import {
  formatResultDate,
  safeDocumentUrl,
} from '../model/service-result-values';
import { ResultFieldList } from './result-field-list';
import { ResultSection } from './result-section';

interface ResidenceResultProps {
  data: Residence;
}

export function ResidenceResult({ data }: ResidenceResultProps) {
  const { t } = useTranslation();
  const fullName = [data.lastName, data.firstName, data.middleName]
    .filter(Boolean)
    .join(' ');
  const permanent = data.permanentRegistration;
  const documentUrl = safeDocumentUrl(data.pdfLink);
  return (
    <>
      <ResultSection
        title={t('serviceResult.person')}
        icon="id-card"
        tone="warning"
      >
        <ResultFieldList
          fields={[
            { label: 'fullName', value: fullName },
            { label: 'birthday', value: formatResultDate(data.birthday) },
            { label: 'gender', value: data.gender },
            { label: 'birthPlace', value: data.birthPlace },
          ]}
        />
      </ResultSection>
      <ResultSection
        title={t('serviceResult.permanentRegistration')}
        icon="shield"
        tone="success"
      >
        <ResultFieldList
          fields={[
            { label: 'address', value: permanent.address },
            { label: 'cadaster', value: permanent.cadaster },
            { label: 'region', value: permanent.region },
            { label: 'district', value: permanent.district },
            {
              label: 'registrationDate',
              value: formatResultDate(permanent.registrationDate),
            },
          ]}
        />
      </ResultSection>
      <ResultSection
        title={t('serviceResult.document')}
        className="col-span-full"
        icon="passport"
      >
        {data.document ? (
          <ResultFieldList
            columns={4}
            fields={[
              { label: 'serialNumber', value: data.document.serialNumber },
              { label: 'issuedBy', value: data.document.issuedBy },
              {
                label: 'dateIssue',
                value: formatResultDate(data.document.dateIssue),
              },
              {
                label: 'dateValid',
                value: formatResultDate(data.document.dateValid),
              },
            ]}
          />
        ) : (
          <p className="text-kiosk-description text-kiosk-text-muted">
            {t('serviceResult.notProvided')}
          </p>
        )}
        {documentUrl ? (
          <a
            className="inline-flex items-center justify-center min-h-kiosk-16 rounded-kiosk-sm border border-kiosk-control-border bg-kiosk-primary-soft text-kiosk-primary px-kiosk-6 py-kiosk-3 text-kiosk-description font-bold hover:border-kiosk-primary"
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
          >
            {t('serviceResult.viewCertificate')}
          </a>
        ) : (
          <p className="text-kiosk-description text-kiosk-text-muted">
            {t('serviceResult.documentUnavailable')}
          </p>
        )}
      </ResultSection>
      <ResultSection
        title={t('serviceResult.temporaryRegistrations')}
        count={data.temporaryRegistrations.length}
        className="col-span-full"
        icon="shield"
        tone="warning"
      >
        {data.temporaryRegistrations.length === 0 && (
          <p className="text-kiosk-description text-kiosk-text-muted">
            {t('serviceResult.noTemporaryRegistrations')}
          </p>
        )}
        {data.temporaryRegistrations.map((registration, index) => (
          <div
            key={index}
            className="border-t border-kiosk-border pt-kiosk-4 first:border-0 first:pt-0"
          >
            <ResultFieldList
              fields={[
                { label: 'address', value: registration.address },
                { label: 'cadaster', value: registration.cadaster },
                { label: 'region', value: registration.region },
                { label: 'district', value: registration.district },
                {
                  label: 'registrationDate',
                  value: formatResultDate(registration.registrationDate),
                },
                {
                  label: 'validDate',
                  value: formatResultDate(registration.validDate),
                },
              ]}
            />
          </div>
        ))}
      </ResultSection>
    </>
  );
}
