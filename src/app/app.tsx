import { BrowserRouter } from 'react-router';
import { AppProviders } from './providers/app-providers';
import { AppRouter } from './router/app-router';
import { AppErrorBoundary } from './ui/app-error-boundary';

export function App() {
  return (
    <AppProviders>
      <AppErrorBoundary>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AppErrorBoundary>
    </AppProviders>
  );
}
