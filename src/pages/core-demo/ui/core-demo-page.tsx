import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { SelectField } from '@/shared/ui/select-field';
import { PageHeading } from '@/shared/ui/page-heading';
import type { DemoScenario } from '../api/demo-adapter';
import { DemoProfileList } from './demo-profile-list';
import { DemoLabelForm } from './demo-label-form';
import { CoreDemoPageSkeleton } from './core-demo-page-skeleton';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';

function parseScenario(value: string | null): DemoScenario {
  return value === 'empty' || value === 'error' ? value : 'success';
}

export function CoreDemoPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const scenario = parseScenario(searchParams.get('scenario'));
  if (isSkeletonPreview(searchParams.toString()))
    return <CoreDemoPageSkeleton />;
  return (
    <div className="page-container py-kiosk-10 px-kiosk-page-gutter page-container--narrow w-[min(100%,_1000px)] mx-auto stack grid gap-kiosk-6">
      <PageHeading
        title={t('demo.title')}
        description={t('demo.description')}
      />
      <section
        className="stack grid gap-kiosk-6"
        aria-labelledby="demo-profiles-title"
      >
        <h2 id="demo-profiles-title">{t('demo.profiles')}</h2>
        <label className="form-field grid gap-kiosk-2 [&_label]:font-bold">
          {t('demo.scenario')}
          <SelectField
            value={scenario}
            onChange={(event) => {
              void setSearchParams(
                { scenario: parseScenario(event.target.value) },
                { replace: true },
              );
            }}
          >
            {['success', 'empty', 'error'].map((value) => (
              <option key={value} value={value}>
                {t(`demo.${value}`)}
              </option>
            ))}
          </SelectField>
        </label>
        <DemoProfileList scenario={scenario} />
      </section>
      <DemoLabelForm />
    </div>
  );
}
