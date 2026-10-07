import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { IdentityForm } from '@/pages/service-placeholder/ui/identity-form';
import { i18n } from '@/shared/lib/i18n';

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

describe('identity field completion', () => {
  it('updates PIN completion through typing, keypad deletion and clearing', async () => {
    const user = userEvent.setup();
    render(<IdentityForm serviceName="Test service" onBack={() => {}} />);
    const pin = screen.getByLabelText(i18n.t('identity.pinLabel'), {
      exact: true,
    });
    expect(pin).toHaveAttribute('data-valid', 'false');
    await user.type(pin, '12345678901234');
    expect(pin).toHaveAttribute('data-valid', 'true');
    await user.click(
      screen.getByRole('button', { name: i18n.t('identity.delete') }),
    );
    expect(pin).toHaveAttribute('data-valid', 'false');
    await user.click(screen.getByRole('button', { name: '4', exact: true }));
    expect(pin).toHaveAttribute('data-valid', 'true');
    await user.click(
      screen.getByRole('button', { name: i18n.t('identity.clear') }),
    );
    expect(pin).toHaveAttribute('data-valid', 'false');
  });

  it('marks passport fields independently and rejects impossible or future dates', async () => {
    const user = userEvent.setup();
    render(<IdentityForm serviceName="Test service" onBack={() => {}} />);
    await user.click(
      screen.getByRole('button', { name: i18n.t('identity.passportMethod') }),
    );
    const series = screen.getByLabelText(i18n.t('identity.seriesLabel'));
    const number = screen.getByLabelText(i18n.t('identity.numberLabel'));
    const birthDate = screen.getByLabelText(i18n.t('identity.birthDateLabel'));
    fireEvent.change(series, { target: { value: 'ab' } });
    expect(series).toHaveAttribute('data-valid', 'true');
    expect(number).toHaveAttribute('data-valid', 'false');
    fireEvent.change(number, { target: { value: '0123456' } });
    expect(number).toHaveAttribute('data-valid', 'true');
    expect(birthDate).toHaveAttribute('data-valid', 'false');
    for (const value of ['29022001', '01012999', '2902200']) {
      fireEvent.change(birthDate, { target: { value } });
      expect(birthDate).toHaveAttribute('data-valid', 'false');
    }
    fireEvent.change(birthDate, { target: { value: '29022000' } });
    expect(birthDate).toHaveAttribute('data-valid', 'true');
    fireEvent.change(number, { target: { value: '012345' } });
    expect(number).toHaveAttribute('data-valid', 'false');
    expect(series).toHaveAttribute('data-valid', 'true');
    expect(birthDate).toHaveAttribute('data-valid', 'true');
  });
});
