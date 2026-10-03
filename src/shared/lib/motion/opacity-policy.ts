import type { MotionProps } from 'framer-motion';

export type OpacityFadeKind = 'page' | 'content' | 'feedback';

export const opacityMotion = {
  entry: 0.94,
  pageEntry: 0,
  pressed: 0.86,
  disabled: 0.55,
  contentDuration: 0.16,
  feedbackDuration: 0.12,
  pageDuration: 0.5,
} as const;

const fadeDurations = {
  page: opacityMotion.pageDuration,
  content: opacityMotion.contentDuration,
  feedback: opacityMotion.feedbackDuration,
} satisfies Record<OpacityFadeKind, number>;

export function getFadeMotion(kind: OpacityFadeKind, reducedMotion: boolean) {
  const initialOpacity =
    kind === 'page' ? opacityMotion.pageEntry : opacityMotion.entry;

  return {
    initial: reducedMotion ? false : { opacity: initialOpacity },
    animate: { opacity: 1 },
    transition: {
      type: 'tween',
      ease: 'easeOut',
      duration: reducedMotion ? 0 : fadeDurations[kind],
    },
  } satisfies MotionProps;
}

export function getButtonMotion(
  reducedMotion: boolean,
  disabled: boolean,
  spacePressed = false,
) {
  return {
    initial: false,
    animate: {
      opacity: disabled
        ? opacityMotion.disabled
        : spacePressed && !reducedMotion
          ? opacityMotion.pressed
          : 1,
    },
    whileTap:
      disabled || reducedMotion
        ? undefined
        : { opacity: opacityMotion.pressed },
    transition: {
      type: 'tween',
      ease: 'easeOut',
      duration: disabled || reducedMotion ? 0 : opacityMotion.feedbackDuration,
    },
  } satisfies MotionProps;
}
