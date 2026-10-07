import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/app-providers';
import { KioskLayout } from '@/app/ui/kiosk-layout';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { OperatorCallDialog } from '@/features/operator-call';
import { i18n } from '@/shared/lib/i18n';
import type { OperatorCallState } from '@/features/operator-call/model/operator-call-controller';

const actions = vi.hoisted(() => ({ start: vi.fn(), hangup: vi.fn() }));
let state: OperatorCallState;
vi.mock('@/features/operator-call/model/use-operator-call', () => ({
  useOperatorCall: () => ({
    ...state,
    ...actions,
    code: '123456',
    token: 'private-token',
  }),
}));

beforeEach(async () => {
  await i18n.changeLanguage('en');
  state = { status: 'idle', error: null, remoteStream: null };
  actions.start.mockReset().mockResolvedValue(undefined);
  actions.hangup.mockReset();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(
    () => undefined,
  );
});
afterEach(() => vi.restoreAllMocks());

function prepare(open = true) {
  const onClose = vi.fn();
  const sessionSignal = new AbortController().signal;
  function view(isOpen: boolean) {
    return (
      <AppProviders>
        <OperatorCallDialog
          open={isOpen}
          onClose={onClose}
          sessionSignal={sessionSignal}
        />
      </AppProviders>
    );
  }
  const rendered = render(view(false));
  const dialog = screen.getByRole<HTMLDialogElement>('dialog', {
    hidden: true,
  });
  dialog.showModal = vi.fn(() => {
    dialog.open = true;
  });
  dialog.close = vi.fn(() => {
    dialog.open = false;
  });
  if (open) rendered.rerender(view(true));
  return {
    ...rendered,
    onClose,
    update: (isOpen = true) => rendered.rerender(view(isOpen)),
  };
}

describe('operator call interface', () => {
  it.each(['close', 'escape'])(
    'returns focus to the actual footer opener after %s removes the modal',
    async (method) => {
      const prototype = HTMLDialogElement.prototype;
      const showModal = Object.getOwnPropertyDescriptor(prototype, 'showModal');
      const close = Object.getOwnPropertyDescriptor(prototype, 'close');
      Object.defineProperty(prototype, 'showModal', {
        configurable: true,
        value: function (this: HTMLDialogElement) {
          this.open = true;
        },
      });
      Object.defineProperty(prototype, 'close', {
        configurable: true,
        value: function (this: HTMLDialogElement) {
          this.open = false;
        },
      });
      useKioskSessionStore.getState().startSession();
      const view = render(
        <AppProviders>
          <MemoryRouter initialEntries={['/home']}>
            <KioskLayout />
          </MemoryRouter>
        </AppProviders>,
      );
      try {
        const opener = screen.getByRole('button', { name: /102/ });
        expect(
          screen.queryByRole('button', { name: 'Call operator' }),
        ).not.toBeInTheDocument();
        await userEvent.click(opener);
        const dialog = screen.getByRole('dialog', { name: 'Call operator' });
        screen.getByRole('button', { name: 'Start call' }).focus();
        expect(opener).not.toHaveFocus();
        if (method === 'close') {
          await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        } else {
          fireEvent(dialog, new Event('cancel', { cancelable: true }));
        }
        expect(
          screen.queryByRole('dialog', { name: 'Call operator' }),
        ).not.toBeInTheDocument();
        expect(opener).toHaveFocus();
      } finally {
        view.unmount();
        useKioskSessionStore.getState().endSession();
        if (showModal) Object.defineProperty(prototype, 'showModal', showModal);
        else Reflect.deleteProperty(prototype, 'showModal');
        if (close) Object.defineProperty(prototype, 'close', close);
        else Reflect.deleteProperty(prototype, 'close');
      }
    },
  );

  it('opens without requesting audio, hides credentials, and starts only on an explicit action', async () => {
    const { update } = prepare(false);
    expect(actions.start).not.toHaveBeenCalled();
    update();
    expect(actions.start).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Call operator');
    expect(document.body).not.toHaveTextContent('123456');
    expect(document.body).not.toHaveTextContent('private-token');
    await userEvent.click(screen.getByRole('button', { name: 'Start call' }));
    expect(actions.start).toHaveBeenCalledTimes(1);
  });

  it('ends an active call on the end button and requests closure', async () => {
    state.status = 'ringing';
    const { onClose } = prepare();
    expect(screen.getByText('Waiting for an operator')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Start call' }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'End call' }));
    expect(actions.hangup).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cancels the call when Escape triggers the native dialog cancellation', () => {
    state.status = 'connected';
    const { onClose } = prepare();
    const event = new Event('cancel', { cancelable: true });
    fireEvent(screen.getByRole('dialog'), event);
    expect(event.defaultPrevented).toBe(true);
    expect(actions.hangup).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('offers an explicit retry after a microphone error', async () => {
    state.status = 'error';
    state.error = 'microphone_denied';
    prepare();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Microphone access was denied',
    );
    expect(actions.start).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(actions.start).toHaveBeenCalledTimes(1);
  });

  it('offers a user gesture when remote audio playback is blocked and detaches audio on end', async () => {
    vi.stubGlobal('MediaStream', class {});
    state.status = 'connected';
    state.remoteStream = new MediaStream();
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    play.mockRejectedValueOnce(new DOMException('Blocked', 'NotAllowedError'));
    const { update } = prepare();
    const audio = document.querySelector('audio');
    expect(audio?.srcObject).toBe(state.remoteStream);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Enable sound' }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Enable sound' }),
      ).not.toBeInTheDocument(),
    );
    expect(play).toHaveBeenCalledTimes(2);
    state = { status: 'ended', error: null, remoteStream: null };
    update();
    expect(audio?.srcObject).toBeNull();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(screen.getByText('Call ended')).toBeVisible();
  });
});
