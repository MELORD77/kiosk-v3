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

describe('double-click and single-finger fullscreen gesture', () => {
  let now = 0;
  const request = vi.fn<() => Promise<void>>();
  const exit = vi.fn<() => Promise<void>>();
  const first = finger(1);
  const second = finger(2, 150);

  function tap() {
    touchEvent('touchstart', [first]);
    now += 40;
    return touchEvent('touchend', [], [first]);
  }

  function doubleClick(touchSource = false) {
    const event = new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100,
    });
    if (touchSource) {
      Object.defineProperty(event, 'sourceCapabilities', {
        value: { firesTouchEvents: true },
      });
    }
    document.body.dispatchEvent(event);
    return event;
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('enters synchronously after two fully released taps and exits on the next gesture', async () => {
    renderHook(useFullscreenGesture);
    expect(tap().defaultPrevented).toBe(false);
    expect(request).not.toHaveBeenCalled();
    now += 80;
    expect(tap().defaultPrevented).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: document.documentElement,
    });
    now += 80;
    tap();
    now += 80;
    tap();
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('toggles synchronously on mouse double-click without waiting for touch', async () => {
    renderHook(useFullscreenGesture);
    expect(doubleClick().defaultPrevented).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: document.documentElement,
    });
    doubleClick();
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('leaves ordinary single-finger taps and mouse clicks alone', () => {
    renderHook(useFullscreenGesture);
    tap();
    const click = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100,
    });
    document.body.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });

  it('suppresses compatibility touch clicks after the completed double tap', () => {
    renderHook(useFullscreenGesture);
    tap();
    tap();
    const click = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100,
    });
    Object.defineProperty(click, 'sourceCapabilities', {
      value: { firesTouchEvents: true },
    });
    document.body.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
  });

  it('ignores synthesized double-clicks even after the fullscreen request settles', async () => {
    renderHook(useFullscreenGesture);
    tap();
    tap();
    await Promise.resolve();
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: document.documentElement,
    });
    doubleClick(true);
    doubleClick();
    expect(request).toHaveBeenCalledTimes(1);
    expect(exit).not.toHaveBeenCalled();
    now += 501;
    doubleClick();
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it.each(['movement', 'third finger', 'cancel', 'replacement finger'])(
    'rejects %s without triggering fullscreen',
    (reason) => {
      renderHook(useFullscreenGesture);
      tap();
      touchEvent('touchstart', [first]);
      let remaining = [first];
      if (reason === 'movement') {
        remaining = [finger(1, 130)];
        expect(touchEvent('touchmove', remaining).defaultPrevented).toBe(false);
      } else if (reason === 'third finger') {
        remaining = [first, second, finger(3)];
        touchEvent('touchstart', remaining, [finger(3)]);
      } else if (reason === 'cancel') {
        touchEvent('touchcancel', [], remaining);
      } else {
        touchEvent('touchstart', [first, second], [second]);
        touchEvent('touchend', [second], [first]);
        remaining = [second, finger(3)];
        touchEvent('touchstart', remaining, [finger(3)]);
      }
      expect(touchEvent('touchend', [], remaining).defaultPrevented).toBe(
        false,
      );
      tap();
      expect(request).not.toHaveBeenCalled();
    },
  );

  it('blocks pinch zoom until all fingers are released and preserves one-finger scrolling', () => {
    renderHook(useFullscreenGesture);
    tap();
    touchEvent('touchstart', [first]);
    expect(
      touchEvent('touchstart', [first, second], [second]).defaultPrevented,
    ).toBe(true);
    expect(
      touchEvent('touchmove', [finger(1, 50), finger(2, 250)]).defaultPrevented,
    ).toBe(true);
    touchEvent('touchend', [first], [second]);
    expect(touchEvent('touchmove', [first]).defaultPrevented).toBe(false);
    touchEvent('touchend', [], [first]);
    tap();
    expect(request).not.toHaveBeenCalled();
  });

  it('blocks browser gesture zoom events', () => {
    renderHook(useFullscreenGesture);
    for (const type of ['gesturestart', 'gesturechange']) {
      const event = new Event(type, { bubbles: true, cancelable: true });
      document.body.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }
  });

  it('rejects long presses, multi-finger taps, expired repeats and distant taps', () => {
    renderHook(useFullscreenGesture);
    tap();
    touchEvent('touchstart', [first]);
    now += 301;
    touchEvent('touchend', [], [first]);
    tap();
    expect(request).not.toHaveBeenCalled();
    touchEvent('touchstart', [first]);
    now += 121;
    touchEvent('touchstart', [first, second], [second]);
    touchEvent('touchend', [], [first, second]);
    tap();
    expect(request).not.toHaveBeenCalled();
    now += 401;
    tap();
    expect(request).not.toHaveBeenCalled();
    touchEvent('touchstart', [finger(1, 400)]);
    touchEvent('touchend', [], [finger(1, 400)]);
    expect(request).not.toHaveBeenCalled();
  });

  it('handles denied and unsupported fullscreen APIs without breaking subsequent gestures', async () => {
    renderHook(useFullscreenGesture);
    request.mockRejectedValueOnce(new Error('Not allowed'));
    tap();
    tap();
    await Promise.resolve();
    expect(request).toHaveBeenCalledTimes(1);
    request.mockImplementationOnce(() => {
      throw new Error('Restricted');
    });
    tap();
    expect(() => tap()).not.toThrow();
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: undefined,
    });
    tap();
    expect(() => tap()).not.toThrow();
  });

  it('cleans up listeners on unmount and resets interrupted gestures on blur', () => {
    const { unmount } = renderHook(useFullscreenGesture);
    tap();
    window.dispatchEvent(new Event('blur'));
    tap();
    expect(request).not.toHaveBeenCalled();
    unmount();
    tap();
    tap();
    doubleClick();
    const zoom = new Event('gesturestart', { bubbles: true, cancelable: true });
    document.body.dispatchEvent(zoom);
    expect(zoom.defaultPrevented).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });

  it('does not issue another fullscreen request while the transition is pending', async () => {
    let resolveRequest: (() => void) | undefined;
    request.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    renderHook(useFullscreenGesture);
    tap();
    tap();
    tap();
    tap();
    expect(request).toHaveBeenCalledTimes(1);
    resolveRequest?.();
    await Promise.resolve();
    tap();
    tap();
    expect(request).toHaveBeenCalledTimes(2);
  });
});
