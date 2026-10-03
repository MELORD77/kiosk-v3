import { BrowserRouter, HashRouter } from 'react-router';
import { env } from '@/shared/config';
import { AppProviders } from './providers/app-providers';
import { AppRouter } from './router/app-router';
import { AppErrorBoundary } from './ui/app-error-boundary';

export function App() {
  const Router = env.routerMode === 'hash' ? HashRouter : BrowserRouter;
  const basename =
    env.routerMode === 'browser' ? import.meta.env.BASE_URL : undefined;

  return (
    <AppProviders>
      <AppErrorBoundary>
        <Router basename={basename}>
          <AppRouter />
        </Router>
      </AppErrorBoundary>
    </AppProviders>
  );
}
