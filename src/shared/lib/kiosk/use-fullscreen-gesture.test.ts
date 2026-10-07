import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFullscreenGesture } from './use-fullscreen-gesture';

class Touches extends Array<Touch> {
  item(index: number) {
    return this[index] ?? null;
  }
}

function finger(identifier: number, x = 100, y = 100): Touch {
  return {
    identifier,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
    target: document.body,
  };
}

function touchEvent(type: string, active: Touch[], changed = active) {
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: new Touches(...active),
    changedTouches: new Touches(...changed),
  });
  document.body.dispatchEvent(event);
  return event;
}

function click(x = 100, detail = 1, touchSource = false, button = 0) {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: 100,
    detail,
    button,
  });
  if (touchSource) {
    Object.defineProperty(event, 'sourceCapabilities', {
      value: { firesTouchEvents: true },
    });
  }
  document.body.dispatchEvent(event);
  return event;
}

function doubleClick() {
  const event = new MouseEvent('dblclick', {
    bubbles: true,
    cancelable: true,
    detail: 2,
  });
  document.body.dispatchEvent(event);
  return event;
}

describe('triple-click and single-finger triple-tap fullscreen gesture', () => {
  let now = 0;
  const request = vi.fn<() => Promise<void>>();
  const exit = vi.fn<() => Promise<void>>();
  const first = finger(1);
  const second = finger(2, 150);

  function tap(x = 100) {
    const point = finger(1, x);
    touchEvent('touchstart', [point]);
    now += 40;
    return touchEvent('touchend', [], [point]);
  }

  function tripleTap() {
    tap();
    tap();
    return tap();
  }

  function tripleClick() {
    click();
    click();
    return click();
  }

  beforeEach(() => {
    now = 0;
    request.mockReset().mockResolvedValue();
    exit.mockReset().mockResolvedValue();
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: request,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exit,
    });
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: null,
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('preserves two mouse clicks and toggles synchronously only on the third', async () => {
    renderHook(useFullscreenGesture);
    expect(click().defaultPrevented).toBe(false);
    expect(click(100, 2).defaultPrevented).toBe(false);
    doubleClick();
    expect(request).not.toHaveBeenCalled();
    click(100, 3);
    expect(request).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: document.documentElement,
    });
    click();
    click();
    expect(exit).not.toHaveBeenCalled();
    click();
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('preserves two touch taps and toggles synchronously only on the third', async () => {
    renderHook(useFullscreenGesture);
    expect(tap().defaultPrevented).toBe(false);
    expect(tap().defaultPrevented).toBe(false);
    expect(request).not.toHaveBeenCalled();
    expect(tap().defaultPrevented).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: document.documentElement,
    });
    tap();
    tap();
    expect(exit).not.toHaveBeenCalled();
    tap();
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('never toggles for standalone double-click events', () => {
    renderHook(useFullscreenGesture);
    doubleClick();
    doubleClick();
    doubleClick();
    expect(request).not.toHaveBeenCalled();
  });

  it('does not count or suppress compatibility clicks from the first two touches', async () => {
    renderHook(useFullscreenGesture);
    tap();
    expect(click(100, 1, true).defaultPrevented).toBe(false);
    tap();
    expect(click(100, 2).defaultPrevented).toBe(false);
    expect(request).not.toHaveBeenCalled();
    tap();
    await Promise.resolve();
    expect(click(100, 3, true).defaultPrevented).toBe(true);
    click();
    click();
    doubleClick();
    expect(request).toHaveBeenCalledTimes(1);
    now += 501;
    tripleClick();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it.each(['mouse', 'touch'])(
    'restarts %s sequences after timeout or movement outside the first tap area',
    (input) => {
      renderHook(useFullscreenGesture);
      const press = input === 'mouse' ? click : tap;
      press();
      press();
      now += 401;
      press();
      press();
      expect(request).not.toHaveBeenCalled();
      now += 401;
      press();
      press(170);
      press(240);
      expect(request).not.toHaveBeenCalled();
      press(240);
      press(240);
      expect(request).toHaveBeenCalledTimes(1);
    },
  );

  it('ignores keyboard and non-primary mouse clicks and resets their sequence', () => {
    renderHook(useFullscreenGesture);
    click();
    click();
    click(100, 0);
    click();
    click();
    expect(request).not.toHaveBeenCalled();
    click(100, 1, false, 2);
    click();
    click();
    expect(request).not.toHaveBeenCalled();
  });

  it.each(['movement', 'multi-touch', 'cancel', 'long press', 'blur'])(
    'resets touch sequences on %s',
    (reason) => {
      renderHook(useFullscreenGesture);
      tap();
      tap();
      touchEvent('touchstart', [first]);
      if (reason === 'movement') {
        expect(touchEvent('touchmove', [finger(1, 130)]).defaultPrevented).toBe(
          false,
        );
      } else if (reason === 'multi-touch') {
        expect(
          touchEvent('touchstart', [first, second], [second]).defaultPrevented,
        ).toBe(true);
        expect(
          touchEvent('touchmove', [first, finger(2, 300)]).defaultPrevented,
        ).toBe(true);
        touchEvent('touchend', [first], [second]);
      } else if (reason === 'cancel') {
        touchEvent('touchcancel', [], [first]);
      } else if (reason === 'long press') {
        now += 301;
      } else {
        window.dispatchEvent(new Event('blur'));
      }
      touchEvent('touchend', [], [first]);
      tap();
      tap();
      expect(request).not.toHaveBeenCalled();
      tap();
      expect(request).toHaveBeenCalledTimes(1);
    },
  );

  it('resets mouse sequences on blur and does not combine mouse with touch', () => {
    renderHook(useFullscreenGesture);
    click();
    click();
    window.dispatchEvent(new Event('blur'));
    click();
    tap();
    tap();
    expect(request).not.toHaveBeenCalled();
    now += 501;
    click();
    click();
    expect(request).not.toHaveBeenCalled();
    click();
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('prevents gesture zoom and removes every listener on unmount', () => {
    const { unmount } = renderHook(useFullscreenGesture);
    for (const type of ['gesturestart', 'gesturechange']) {
      const event = new Event(type, { bubbles: true, cancelable: true });
      document.body.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }
    unmount();
    tripleTap();
    tripleClick();
    const event = new Event('gesturestart', {
      bubbles: true,
      cancelable: true,
    });
    document.body.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });

  it('handles denied, throwing and unsupported APIs without blocking later gestures', async () => {
    renderHook(useFullscreenGesture);
    request.mockRejectedValueOnce(new Error('Not allowed'));
    tripleClick();
    await Promise.resolve();
    request.mockImplementationOnce(() => {
      throw new Error('Restricted');
    });
    expect(tripleClick).not.toThrow();
    expect(request).toHaveBeenCalledTimes(2);
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: undefined,
    });
    expect(tripleClick).not.toThrow();
  });

  it('does not issue another request while pending and resets after each triple', async () => {
    let resolveRequest: (() => void) | undefined;
    request.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    renderHook(useFullscreenGesture);
    tripleTap();
    tripleTap();
    expect(request).toHaveBeenCalledTimes(1);
    resolveRequest?.();
    await Promise.resolve();
    tap();
    tap();
    expect(request).toHaveBeenCalledTimes(1);
    tap();
    expect(request).toHaveBeenCalledTimes(2);
  });
});
