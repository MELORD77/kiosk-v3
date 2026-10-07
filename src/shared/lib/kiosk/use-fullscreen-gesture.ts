import { useEffect, type RefObject } from 'react';

const tapDurationMs = 300;
const repeatGapMs = 400;
const movementPx = 24;
const repeatDistancePx = 80;
const compatibilityClickMs = 500;

interface Point {
  x: number;
  y: number;
}

interface Tap {
  endedAt: number;
  center: Point;
}

interface Sequence extends Tap {
  count: number;
}

function advanceSequence(
  sequence: Sequence | null,
  center: Point,
  now: number,
): Sequence {
  if (
    sequence &&
    now - sequence.endedAt <= repeatGapMs &&
    distance(center, sequence.center) <= repeatDistancePx
  ) {
    return { ...sequence, endedAt: now, count: sequence.count + 1 };
  }
  return { endedAt: now, center, count: 1 };
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isTouchClick(event: MouseEvent) {
  if ('pointerType' in event && event.pointerType === 'touch') return true;
  if ('sourceCapabilities' in event) {
    const capabilities = event.sourceCapabilities;
    return (
      typeof capabilities === 'object' &&
      capabilities !== null &&
      'firesTouchEvents' in capabilities &&
      capabilities.firesTouchEvents === true
    );
  }
  return false;
}

export function useFullscreenGesture(targetRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let transitionPending = false;
    let startedAt = 0;
    let invalid = false;
    let touchSequence: Sequence | null = null;
    let mouseSequence: Sequence | null = null;
    let lastTouch: Tap | null = null;
    let suppressUntil = 0;
    let suppressedPoints: Point[] = [];
    const origins = new Map<number, Point>();

    function isTarget(event: Event) {
      return (
        event.target instanceof Node &&
        targetRef.current?.contains(event.target) === true
      );
    }

    function toggleFullscreen() {
      if (transitionPending) return;
      try {
        const operation = document.fullscreenElement
          ? document.exitFullscreen?.()
          : document.documentElement.requestFullscreen?.();
        if (operation) {
          transitionPending = true;
          const settled = () => {
            transitionPending = false;
          };
          void operation.then(settled, settled);
        }
      } catch {
        // Unsupported or restricted browsers must keep the kiosk usable.
        transitionPending = false;
      }
    }

    function invalidate() {
      invalid = true;
      touchSequence = null;
      mouseSequence = null;
    }

    function checkMovement(touches: TouchList) {
      for (const touch of Array.from(touches)) {
        const origin = origins.get(touch.identifier);
        if (
          !origin ||
          distance(origin, { x: touch.clientX, y: touch.clientY }) > movementPx
        ) {
          invalidate();
        }
      }
    }

    function handleStart(event: TouchEvent) {
      const now = performance.now();
      mouseSequence = null;
      if (origins.size === 0) {
        startedAt = now;
        invalid = false;
      }
      if (!isTarget(event)) invalidate();
      for (const touch of Array.from(event.changedTouches)) {
        origins.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
      }
      if (origins.size > 1 || event.touches.length > 1) {
        invalidate();
        if (event.cancelable) event.preventDefault();
      }
      checkMovement(event.touches);
    }

    function handleMove(event: TouchEvent) {
      if (event.touches.length > 1) {
        invalidate();
        if (event.cancelable) event.preventDefault();
      }
      checkMovement(event.touches);
    }

    function handleEnd(event: TouchEvent) {
      const now = performance.now();
      checkMovement(event.changedTouches);
      checkMovement(event.touches);
      if (now - startedAt > tapDurationMs) invalidate();
      const [endedTouch] = Array.from(event.changedTouches);
      if (endedTouch) {
        lastTouch = {
          endedAt: now,
          center: { x: endedTouch.clientX, y: endedTouch.clientY },
        };
      }
      if (event.touches.length > 0) return;

      if (origins.size === 1 && !invalid) {
        const points = Array.from(origins.values());
        const center = {
          x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
          y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
        };
        touchSequence = advanceSequence(touchSequence, center, now);
        if (touchSequence.count === 3) {
          touchSequence = null;
          if (event.cancelable) event.preventDefault();
          suppressedPoints = points;
          suppressUntil = now + compatibilityClickMs;
          // touchend grants user activation; do not defer the API call.
          toggleFullscreen();
        }
      } else {
        touchSequence = null;
      }
      origins.clear();
      invalid = false;
    }

    function handleCancel() {
      origins.clear();
      invalid = false;
      touchSequence = null;
      mouseSequence = null;
      lastTouch = null;
      suppressUntil = 0;
    }

    function handleClick(event: MouseEvent) {
      if (!isTarget(event)) {
        invalidate();
        return;
      }
      const now = performance.now();
      const center = { x: event.clientX, y: event.clientY };
      const followsTouch =
        lastTouch !== null &&
        now - lastTouch.endedAt <= compatibilityClickMs &&
        distance(lastTouch.center, center) <= repeatDistancePx;
      if (
        now <= suppressUntil &&
        (isTouchClick(event) || followsTouch) &&
        suppressedPoints.some(
          (point) =>
            distance(point, { x: event.clientX, y: event.clientY }) <=
            movementPx,
        )
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      if (isTouchClick(event) || followsTouch) return;
      if (event.button !== 0 || event.detail === 0) {
        mouseSequence = null;
        return;
      }
      touchSequence = null;
      mouseSequence = advanceSequence(mouseSequence, center, now);
      if (mouseSequence.count === 3) {
        mouseSequence = null;
        toggleFullscreen();
      }
    }

    function handleDoubleClick(event: MouseEvent) {
      if (event.cancelable) event.preventDefault();
    }

    function preventGestureZoom(event: Event) {
      invalidate();
      if (event.cancelable) event.preventDefault();
    }

    document.addEventListener('touchstart', handleStart, {
      capture: true,
      passive: false,
    });
    document.addEventListener('touchmove', handleMove, {
      capture: true,
      passive: false,
    });
    document.addEventListener('touchend', handleEnd, {
      capture: true,
      passive: false,
    });
    document.addEventListener('touchcancel', handleCancel, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('dblclick', handleDoubleClick, true);
    document.addEventListener('gesturestart', preventGestureZoom, {
      capture: true,
      passive: false,
    });
    document.addEventListener('gesturechange', preventGestureZoom, {
      capture: true,
      passive: false,
    });
    window.addEventListener('blur', handleCancel);
    return () => {
      document.removeEventListener('touchstart', handleStart, true);
      document.removeEventListener('touchmove', handleMove, true);
      document.removeEventListener('touchend', handleEnd, true);
      document.removeEventListener('touchcancel', handleCancel, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('dblclick', handleDoubleClick, true);
      document.removeEventListener('gesturestart', preventGestureZoom, true);
      document.removeEventListener('gesturechange', preventGestureZoom, true);
      window.removeEventListener('blur', handleCancel);
    };
  }, [targetRef]);
}
