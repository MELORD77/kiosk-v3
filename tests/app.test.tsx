import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { AppProviders } from '@/app/providers/app-providers';
import { AppRouter } from '@/app/router/app-router';
import { App } from '@/app/app';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { i18n } from '@/shared/lib/i18n';
import { useThemeStore } from '@/shared/lib/theme';
import { useOrientationStore } from '@/shared/lib/kiosk';
import { catalogResponse } from './fixtures/service-catalog';
import type * as SharedApi from '@/shared/api';

vi.mock('@/shared/api', async (importOriginal) => {
  const original = await importOriginal<typeof SharedApi>();
  return {
    ...original,
    apiClient: original.createApiClient({
      fetcher: (input, init) => globalThis.fetch(input, init),
    }),
  };
});

beforeEach(async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL | Request) =>
      Promise.resolve(
        catalogResponse(
          new URL(
            input instanceof Request ? input.url : input.toString(),
            'http://localhost',
          ),
        ),
      ),
    ),
  );
  useKioskSessionStore.getState().endSession();
  useThemeStore.getState().setPreference('light');
  useOrientationStore.getState().setPreference('auto');
  await i18n.changeLanguage('en');
});

function renderRoute(path: string) {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe('application integration', () => {
  it('starts a kiosk session from the design welcome page and opens the service catalog', async () => {
    const user = userEvent.setup();
    renderRoute('/');
    await user.click(screen.getByRole('button', { name: /English/ }));
    expect(
      await screen.findByRole('heading', { name: 'How can we help?' }),
    ).toBeInTheDocument();
    expect(useKioskSessionStore.getState().isActive).toBe(true);
    expect(
      await screen.findByRole('button', {
        name: 'Registration of foreign citizens and stateless persons at their place of temporary stay in Uzbekistan',
      }),
    ).toBeInTheDocument();
  });

  it('shows a recoverable 404 for an unknown route', async () => {
    renderRoute('/missing-page');
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
  });

  it('finishes a session and does not reactivate it on the old route', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/home');
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Finish' }));
    expect(
      await screen.findByRole('button', { name: /English/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Finish' }),
    ).not.toBeInTheDocument();
    expect(useKioskSessionStore.getState().isActive).toBe(false);
  });

  it('renders demo success and validates/awaits form submission', async () => {
    const user = userEvent.setup();
    renderRoute('/core-demo');
    const label = await screen.findByRole('textbox', { name: 'Example label' });
    await user.click(screen.getByRole('button', { name: 'Check example' }));
    expect(await screen.findByText('Enter a label')).toBeInTheDocument();
    await user.type(label, 'Test kiosk');
    await user.click(screen.getByRole('button', { name: 'Check example' }));
    expect(
      await screen.findByText('Example checked: Test kiosk'),
    ).toBeInTheDocument();
  });

  it('shows the demo submit failure instead of claiming a real request succeeded', async () => {
    const user = userEvent.setup();
    renderRoute('/core-demo');
    await user.type(
      await screen.findByRole('textbox', { name: 'Example label' }),
      'error',
    );
    await user.click(screen.getByRole('button', { name: 'Check example' }));
    expect(
      await screen.findByText('The example could not be checked'),
    ).toBeInTheDocument();
  });

  it.each([
    ['empty', 'No profiles found'],
    ['error', 'Demonstration error'],
  ])('renders the %s query state', async (scenario, title) => {
    renderRoute(`/core-demo?scenario=${scenario}`);
    expect(await screen.findByText(title)).toBeInTheDocument();
  });
});
