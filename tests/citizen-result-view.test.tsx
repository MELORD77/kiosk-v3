import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/app-providers';
import { ServiceResultView } from '@/pages/service-placeholder/ui/service-result-view';
import {
  formatResultDate,
  safeDocumentUrl,
} from '@/pages/service-placeholder/model/service-result-values';
import { i18n } from '@/shared/lib/i18n';
import type { CitizenServiceResult } from '@/entities/citizen-service';
import { citizenResults } from './fixtures/citizen-results';

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

function show(data: CitizenServiceResult) {
  return render(
    <AppProviders>
      <ServiceResultView data={data} />
    </AppProviders>,
  );
}

describe('citizen result presentation', () => {
  it('renders residence data with calendar dates and the supplied PDF link', () => {
    const data = citizenResults.find((item) => item.number === 7);
    if (!data) throw new Error('Residence fixture missing');
    show(data);
    expect(screen.getByText('CITIZEN EXAMPLE')).toBeVisible();
    expect(screen.getAllByText('12.03.2015')[0]).toBeVisible();
    expect(screen.getByText('01.02.2020')).toBeVisible();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://documents.example.test/residence.pdf',
    );
  });

  it('does not expose unsafe PDF links and tolerates a missing passport', () => {
    const data = citizenResults.find((item) => item.number === 7);
    if (!data || data.number !== 7)
      throw new Error('Residence fixture missing');
    show({
      number: 7,
      result: {
        ...data.result,
        document: null,
        pdfLink: 'javascript:alert(1)',
      },
    });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('AA0000000')).not.toBeInTheDocument();
  });

  it('preserves supplied resident status and separates permanent and temporary entries', () => {
    const data = citizenResults.find((item) => item.number === 8);
    if (!data) throw new Error('Residents fixture missing');
    show(data);
    expect(screen.getByText('EXAMPLE RESIDENT')).toBeVisible();
    expect(screen.getByText('EXAMPLE TEMPORARY RESIDENT')).toBeVisible();
    expect(screen.getByText('ДОИМИЙ РЎЙХАТДА')).toBeVisible();
    expect(screen.getByText('10.01.2027')).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('keeps every resident in accessible rows and includes temporary expiry dates', () => {
    const data = citizenResults.find((item) => item.number === 8);
    if (!data || data.number !== 8)
      throw new Error('Residents fixture missing');
    const permanent = Array.from({ length: 25 }, (_, index) => ({
      fullName: `EXAMPLE RESIDENT ${index + 1}`,
      status: null,
      registrationDate: null,
    }));
    show({ number: 8, result: { ...data.result, permanent } });
    const table = screen.getByRole('table', {
      name: i18n.t('serviceResult.permanentResidents'),
    });
    expect(within(table).getAllByRole('row')).toHaveLength(26);
    expect(within(table).getByText('EXAMPLE RESIDENT 25')).toBeVisible();
    expect(
      within(table).getAllByText(i18n.t('serviceResult.notProvided')),
    ).toHaveLength(75);
    const temporary = screen.getByRole('table', {
      name: i18n.t('serviceResult.temporaryResidents'),
    });
    expect(
      within(temporary).getByRole('columnheader', {
        name: i18n.t('serviceResult.validDate'),
      }),
    ).toBeVisible();
    expect(within(temporary).getByText('10.01.2027')).toBeVisible();
  });

  it('separates valid resident birthdays into their own permanent and temporary cells', () => {
    const data = citizenResults.find((item) => item.number === 8);
    if (!data || data.number !== 8)
      throw new Error('Residents fixture missing');
    show({
      number: 8,
      result: {
        ...data.result,
        permanent: [
          {
            fullName: 'EXAMPLE (OTHER NAME) (29.02.2000)',
            status: 'Permanent',
            registrationDate: '2020-01-01',
          },
        ],
        temporary: [
          {
            fullName: 'TEMPORARY EXAMPLE (15.04.1990)',
            status: 'Temporary',
            registrationDate: '2025-01-01',
            validDate: '2027-01-01',
          },
        ],
      },
    });
    expect(
      screen.getAllByRole('columnheader', {
        name: i18n.t('serviceResult.birthday'),
      }),
    ).toHaveLength(2);
    expect(
      screen.getByRole('cell', { name: 'EXAMPLE (OTHER NAME)' }),
    ).toBeVisible();
    expect(screen.getByRole('cell', { name: '29.02.2000' })).toBeVisible();
    expect(
      screen.getByRole('cell', { name: 'TEMPORARY EXAMPLE' }),
    ).toBeVisible();
    expect(screen.getByRole('cell', { name: '15.04.1990' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '01.01.2027' })).toBeVisible();
  });

  it.each(['uz', 'uzc', 'ru', 'en'])(
    'translates resident column headings in %s',
    async (language) => {
      await i18n.changeLanguage(language);
      const data = citizenResults.find((item) => item.number === 8);
      if (!data) throw new Error('Residents fixture missing');
      const { container } = show(data);
      expect(
        screen.getAllByRole('columnheader', {
          name: i18n.t('serviceResult.rowNumber'),
        }),
      ).toHaveLength(2);
      expect(container.textContent).not.toMatch(/serviceResult\./);
    },
  );

  it('expands known criminal-record details without dumping unknown objects', async () => {
    const data = citizenResults.find((item) => item.number === 12);
    if (!data) throw new Error('Criminal fixture missing');
    const { container } = show(data);
    const button = screen.getByRole('button', {
      name: i18n.t('serviceResult.showDetails'),
      exact: true,
    });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Example article')).toBeVisible();
    expect(
      screen.getByText(i18n.t('serviceResult.structuredDetailsUnavailable')),
    ).toBeVisible();
    expect(container).not.toHaveTextContent('UNCONFIRMED_NESTED_VALUE');
    expect(container).not.toHaveTextContent('[object Object]');
  });

  it.each([
    { number: 12, result: { isConvicted: false, records: [] } },
    { number: 22, result: { isReleased: false, records: [] } },
  ] satisfies CitizenServiceResult[])(
    'displays an explicit negative result for $number',
    (data) => {
      show(data);
      const key =
        data.number === 12
          ? 'serviceResult.noConvictions'
          : 'serviceResult.noReleases';
      expect(screen.getByText(i18n.t(key))).toBeVisible();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  it.each([
    { number: 12, result: { isConvicted: true, records: [] } },
    { number: 22, result: { isReleased: true, records: [] } },
  ] satisfies CitizenServiceResult[])(
    'does not claim a negative result for a positive empty response $number',
    (data) => {
      show(data);
      expect(
        screen.getByText(i18n.t('serviceResult.recordsMissing')),
      ).toBeVisible();
      expect(
        screen.queryByText(i18n.t('serviceResult.noConvictions')),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(i18n.t('serviceResult.noReleases')),
      ).not.toBeInTheDocument();
    },
  );

  it.each(['uz', 'uzc', 'ru', 'en'])(
    'renders labels in %s',
    async (language) => {
      await i18n.changeLanguage(language);
      const { container } = show({
        number: 22,
        result: { isReleased: false, records: [] },
      });
      expect(
        screen.getByText(i18n.t('serviceResult.noReleases')),
      ).toBeVisible();
      expect(container.textContent).not.toMatch(/serviceResult\./);
    },
  );
});

describe('result data formatting', () => {
  it.each([
    ['2026-01-10T23:00:00-11:00', '10.01.2026'],
    ['2024-02-29', '29.02.2024'],
    ['2023-02-29', '2023-02-29'],
    ['15.04.1990', '15.04.1990'],
    [null, null],
  ])('preserves the calendar meaning of %s', (input, expected) => {
    expect(formatResultDate(input)).toBe(expected);
  });

  it.each([
    'javascript:alert(1)',
    'data:application/pdf;base64,test',
    '/relative.pdf',
    'file:///private.pdf',
    '',
  ])('rejects unsupported document URLs %s', (url) => {
    expect(safeDocumentUrl(url)).toBeNull();
  });
});
