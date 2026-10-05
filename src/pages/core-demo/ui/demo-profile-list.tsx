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
    <div className="demo-profiles grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-kiosk-3 compact:grid-cols-[1fr]">
      {query.data.map((profile) => (
        <div
          key={profile.id}
          className="demo-profile min-h-[96px] p-kiosk-4 rounded-kiosk-md bg-kiosk-surface border border-solid border-kiosk-border grid gap-kiosk-2 [&_h3]:text-kiosk-md"
        >
          <h3>{t(`settings.${profile.id}`)}</h3>
          <p className="muted text-kiosk-text-muted">
            {profile.width} × {profile.height}
          </p>
        </div>
      ))}
    </div>
  );
}
