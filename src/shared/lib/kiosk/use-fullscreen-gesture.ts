import { useEffect } from 'react';

const tapDurationMs = 300;
const doubleTapGapMs = 400;
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

export function useFullscreenGesture() {
  useEffect(() => {
    let transitionPending = false;
    let startedAt = 0;
    let invalid = false;
    let firstTap: Tap | null = null;
    let suppressUntil = 0;
    let suppressedPoints: Point[] = [];
    const origins = new Map<number, Point>();

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
      firstTap = null;
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
      if (origins.size === 0) {
        startedAt = now;
        invalid = false;
      }
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
      if (event.touches.length > 0) return;

      if (origins.size === 1 && !invalid) {
        const points = Array.from(origins.values());
        const center = {
          x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
          y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
        };
        if (
          firstTap &&
          now - firstTap.endedAt <= doubleTapGapMs &&
          distance(center, firstTap.center) <= repeatDistancePx
        ) {
          firstTap = null;
          if (event.cancelable) event.preventDefault();
          suppressedPoints = points;
          suppressUntil = now + compatibilityClickMs;
          // touchend grants user activation; do not defer the API call.
          toggleFullscreen();
        } else {
          firstTap = { endedAt: now, center };
        }
      } else {
        firstTap = null;
      }
      origins.clear();
      invalid = false;
    }

    function handleCancel() {
      origins.clear();
      invalid = false;
      firstTap = null;
      suppressUntil = 0;
    }

    function handleClick(event: MouseEvent) {
      if (
        performance.now() <= suppressUntil &&
        isTouchClick(event) &&
        suppressedPoints.some(
          (point) =>
            distance(point, { x: event.clientX, y: event.clientY }) <=
            movementPx,
        )
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    function handleDoubleClick(event: MouseEvent) {
      if (event.cancelable) event.preventDefault();
      const followsTouchGesture =
        performance.now() <= suppressUntil &&
        suppressedPoints.some(
          (point) =>
            distance(point, { x: event.clientX, y: event.clientY }) <=
            repeatDistancePx,
        );
      if (isTouchClick(event) || followsTouchGesture) return;
      firstTap = null;
      toggleFullscreen();
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
  }, []);
}
