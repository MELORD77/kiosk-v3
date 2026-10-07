import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { AppProviders } from '@/app/providers/app-providers';
import { BackButton } from '@/shared/ui/back-button';
import { Badge } from '@/shared/ui/badge';
import { ServiceFlowIcon } from '@/pages/service-placeholder/ui/service-flow-icon';
import type { ServiceFlowIconName } from '@/pages/service-placeholder/ui/service-flow-icon';
import { formatResultDate } from '@/pages/service-placeholder/model/service-result-values';
import { citizenResults } from '../tests/fixtures/citizen-results';
import { i18n } from '@/shared/lib/i18n';
import '../src/app/styles/index.css';
import './result-card-variant.css';

const fixture = citizenResults.find((item) => item.number === 7);
if (!fixture || fixture.number !== 7)
  throw new Error('Residence fixture missing');
const residence = fixture.result;
const sections: {
  title: string;
  icon: ServiceFlowIconName;
  tone: string;
  full?: boolean;
  fields: { label: string; value: string | null | undefined }[];
}[] = [
  {
    title: 'person',
    icon: 'id-card',
    tone: 'amber',
    fields: [
      {
        label: 'fullName',
        value: [residence.lastName, residence.firstName].join(' '),
      },
      { label: 'birthday', value: formatResultDate(residence.birthday) },
      { label: 'gender', value: residence.gender },
      { label: 'birthPlace', value: residence.birthPlace },
    ],
  },
  {
    title: 'permanentRegistration',
    icon: 'shield',
    tone: 'green',
    fields: [
      { label: 'address', value: residence.permanentRegistration.address },
      { label: 'cadaster', value: residence.permanentRegistration.cadaster },
      { label: 'region', value: residence.permanentRegistration.region },
      {
        label: 'registrationDate',
        value: formatResultDate(
          residence.permanentRegistration.registrationDate,
        ),
      },
    ],
  },
  {
    title: 'document',
    icon: 'passport',
    tone: 'blue',
    full: true,
    fields: [
      { label: 'serialNumber', value: residence.document?.serialNumber },
      { label: 'issuedBy', value: residence.document?.issuedBy },
      {
        label: 'dateIssue',
        value: formatResultDate(residence.document?.dateIssue),
      },
      {
        label: 'dateValid',
        value: formatResultDate(residence.document?.dateValid),
      },
    ],
  },
];

export function DesignVariant() {
  const { t } = useTranslation();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      document.documentElement.dataset.theme = 'dark';
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <main className="variant-preview">
      <div className="variant-heading">
        <BackButton className="variant-back" />
        <div>
          <p className="variant-eyebrow">
            {t('serviceResult.title')} <Badge tone="primary">02</Badge>
          </p>
          <h1>{t('services.service-7')}</h1>
        </div>
      </div>
      <div className="variant-cards">
        {sections.map(({ title, icon, tone, full, fields }) => (
          <section
            key={title}
            aria-labelledby={`variant-${title}`}
            className={`variant-card${full ? ' variant-card--full' : ''}`}
          >
            <header className="variant-card-header">
              <span
                aria-hidden="true"
                className={`variant-icon variant-icon--${tone}`}
              >
                <ServiceFlowIcon name={icon} />
              </span>
              <h2 id={`variant-${title}`}>{t(`serviceResult.${title}`)}</h2>
            </header>
            <dl
              className={`variant-fields${full ? ' variant-fields--four' : ''}`}
            >
              {fields.map(({ label, value }) => (
                <div key={label} className="variant-field">
                  <dt>{t(`serviceResult.${label}`)}</dt>
                  <dd>{value?.trim() || t('serviceResult.notProvided')}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <section className="variant-empty">
        <span aria-hidden="true" className="variant-empty-icon">
          <ServiceFlowIcon name="shield" />
        </span>
        <div>
          <h2>{t('serviceResult.temporaryRegistrations')}</h2>
          <p>{t('serviceResult.noTemporaryRegistrations')}</p>
        </div>
        <Badge tone="neutral">0</Badge>
      </section>
    </main>
  );
}

void i18n.changeLanguage('uz');
const target = document.getElementById('root');
if (!target) throw new Error('Preview root missing');
createRoot(target).render(
  <AppProviders>
    <DesignVariant />
  </AppProviders>,
);
