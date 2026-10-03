import { layoutStyles } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/classnames';
import { formFieldStyles } from '@/shared/ui/form-field';
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
    <div
      className={cn(
        layoutStyles['page-container'],
        layoutStyles['page-container--narrow'],
        layoutStyles['stack'],
      )}
    >
      <PageHeading
        title={t('demo.title')}
        description={t('demo.description')}
      />
      <section
        className={layoutStyles['stack']}
        aria-labelledby="demo-profiles-title"
      >
        <h2 id="demo-profiles-title">{t('demo.profiles')}</h2>
        <label className={formFieldStyles['form-field']}>
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
