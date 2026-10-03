import { layoutStyles } from '@/shared/lib/ui-styles';
import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
import { pageHeadingStyles } from '@/shared/ui/page-heading';
import { Component, type ReactNode } from 'react';
import { i18n } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';

interface AppErrorBoundaryProps {
  children: ReactNode;
}
interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main
        className={cn(
          layoutStyles['page-container'],
          layoutStyles['page-container--narrow'],
          styles['placeholder-page'],
        )}
      >
        <h1 className={pageHeadingStyles['page-heading']}>
          {i18n.t('error.title')}
        </h1>
        <p className={pageHeadingStyles['page-subtitle']}>
          {i18n.t('error.description')}
        </p>
        <div className={layoutStyles['actions']}>
          <Button
            onClick={() => window.location.assign(import.meta.env.BASE_URL)}
          >
            {i18n.t('common.home')}
          </Button>
        </div>
      </main>
    );
  }
}
