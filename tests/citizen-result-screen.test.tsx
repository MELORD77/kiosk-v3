import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/app-providers';
import { CitizenServiceResultScreen } from '@/pages/service-placeholder/ui/citizen-service-result-screen';
import { i18n } from '@/shared/lib/i18n';
import type { CitizenServiceResult } from '@/entities/citizen-service';
import { citizenResults } from './fixtures/citizen-results';

const fetcher = vi.fn<typeof fetch>();
beforeEach(async () => {
  await i18n.changeLanguage('en');
  fetcher.mockReset();
  vi.stubGlobal('fetch', fetcher);
});

function openResult(data: CitizenServiceResult) {
  const onBack = vi.fn();
  return {
    onBack,
    ...render(
      <AppProviders>
        <CitizenServiceResultScreen
          data={data}
          serviceName="Example service"
          onBack={onBack}
        />
      </AppProviders>,
    ),
  };
}

describe('citizen result screen', () => {
  it.each(citizenResults)(
    'renders returned service $number data without issuing another request',
    (data) => {
      const { container } = openResult(data);
      expect(
        screen.getByText(i18n.t('serviceResult.title')),
      ).toBeInTheDocument();
      expect(fetcher).not.toHaveBeenCalled();
      expect(container).not.toHaveTextContent('[object Object]');
      expect(container).not.toHaveTextContent('UNCONFIRMED_NESTED_VALUE');
      expect(container.querySelector('[aria-busy="true"]')).toBeNull();
    },
  );

  it('keeps back navigation before the heading and avoids duplicate finish controls', async () => {
    const data = citizenResults[0];
    if (!data) throw new Error('Missing result fixture');
    const view = openResult(data);
    const back = screen.getByRole('button', {
      name: i18n.t('common.back'),
      exact: true,
    });
    const heading = screen.getByRole('heading', { name: 'Example service' });
    expect(
      back.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await userEvent.click(back);
    expect(view.onBack).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', {
        name: i18n.t('common.finish'),
        exact: true,
      }),
    ).not.toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
