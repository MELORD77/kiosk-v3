import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/app-providers';
import { BackButton } from '@/shared/ui/back-button';
import {
  BackNavigationProvider,
  useBackNavigation,
} from '@/shared/lib/back-navigation';

function FooterAction() {
  const scope = useBackNavigation();
  if (!scope) return null;
  return (
    <BackButton
      placement="footer"
      onClick={scope.action.onBack}
      disabled={scope.action.disabled}
    />
  );
}

describe('footer back registration', () => {
  it('keeps the latest callback and disabled state without duplicating the button', async () => {
    const first = vi.fn();
    const next = vi.fn();
    const fallback = vi.fn();
    function view(onBack: () => void, disabled = false) {
      return (
        <AppProviders>
          <BackNavigationProvider enabled fallback={fallback}>
            <main>
              <BackButton onClick={onBack} disabled={disabled} />
            </main>
            <FooterAction />
          </BackNavigationProvider>
        </AppProviders>
      );
    }
    const rendered = render(view(first));
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(document.querySelector('main button')).toBeNull();
    await userEvent.click(screen.getByRole('button'));
    expect(first).toHaveBeenCalledTimes(1);
    rendered.rerender(view(next));
    await userEvent.click(screen.getByRole('button'));
    expect(next).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);
    rendered.rerender(view(next, true));
    expect(screen.getByRole('button')).toBeDisabled();
    await userEvent.click(screen.getByRole('button'));
    expect(next).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
  });

  it('does not clear another active registration and restores the fallback after StrictMode cleanup', async () => {
    const parent = vi.fn();
    const child = vi.fn();
    const fallback = vi.fn();
    function view(parentMounted: boolean, childMounted: boolean) {
      return (
        <StrictMode>
          <AppProviders>
            <BackNavigationProvider enabled fallback={fallback}>
              {parentMounted && <BackButton key="parent" onClick={parent} />}
              {childMounted && <BackButton key="child" onClick={child} />}
              <FooterAction />
            </BackNavigationProvider>
          </AppProviders>
        </StrictMode>
      );
    }
    const rendered = render(view(true, true));
    await userEvent.click(screen.getByRole('button'));
    expect(child).toHaveBeenCalledTimes(1);
    rendered.rerender(view(false, true));
    await userEvent.click(screen.getByRole('button'));
    expect(child).toHaveBeenCalledTimes(2);
    expect(parent).not.toHaveBeenCalled();
    rendered.rerender(view(false, false));
    await userEvent.click(screen.getByRole('button'));
    expect(fallback).toHaveBeenCalledTimes(1);
  });

  it('retains local navigation without a managed footer', async () => {
    const onBack = vi.fn();
    render(
      <AppProviders>
        <BackButton onClick={onBack} />
      </AppProviders>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
