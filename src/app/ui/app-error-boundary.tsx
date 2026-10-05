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
      <main className="page-container py-kiosk-10 px-kiosk-page-gutter page-container--narrow w-[min(100%,_1000px)] mx-auto placeholder-page flex-1 grid content-center gap-kiosk-6">
        <h1 className="page-heading text-kiosk-page-heading leading-[1.15] font-extrabold tracking-[-0.025em]">
          {i18n.t('error.title')}
        </h1>
        <p className="page-subtitle text-kiosk-text-muted text-kiosk-description mt-kiosk-3">
          {i18n.t('error.description')}
        </p>
        <div className="actions flex flex-wrap gap-kiosk-3">
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
