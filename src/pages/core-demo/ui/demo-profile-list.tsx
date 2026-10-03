import { styles } from './styles';
import { layoutStyles } from '@/shared/lib/ui-styles';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { StatusPanel } from '@/shared/ui/status-panel';
import { useDemoProfiles } from '../api/demo-profiles';
import type { DemoScenario } from '../api/demo-adapter';
import { DemoProfileListSkeleton } from './demo-profile-list-skeleton';

interface DemoProfileListProps {
  scenario: DemoScenario;
}

export function DemoProfileList({ scenario }: DemoProfileListProps) {
  const { t } = useTranslation();
  const query = useDemoProfiles(scenario);

  if (query.isPending) return <DemoProfileListSkeleton />;
  if (query.isError)
    return (
      <StatusPanel
        tone="error"
        title={t('demo.errorTitle')}
        description={t('demo.errorDescription')}
      >
        <div>
          <Button
            variant="secondary"
            disabled={query.isFetching}
            onClick={() => {
              void query.refetch();
            }}
          >
            {t('common.retry')}
          </Button>
        </div>
      </StatusPanel>
    );
  if (query.data.length === 0)
    return (
      <StatusPanel
        title={t('demo.emptyTitle')}
        description={t('demo.emptyDescription')}
      />
    );

  return (
    <div className={styles['demo-profiles']}>
      {query.data.map((profile) => (
        <div key={profile.id} className={styles['demo-profile']}>
          <h3>{t(`settings.${profile.id}`)}</h3>
          <p className={layoutStyles['muted']}>
            {profile.width} × {profile.height}
          </p>
        </div>
      ))}
    </div>
  );
}
