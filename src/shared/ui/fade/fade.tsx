import type { HTMLAttributes } from 'react';
import { m } from 'framer-motion';
import {
  getFadeMotion,
  useOpacityReducedMotion,
  type OpacityFadeKind,
} from '@/shared/lib/motion';

interface FadeProps extends Pick<
  HTMLAttributes<HTMLElement>,
  'children' | 'className' | 'id' | 'role' | 'aria-live'
> {
  as?: 'div' | 'p';
  kind?: OpacityFadeKind;
}

export function Fade({ as = 'div', kind = 'content', ...props }: FadeProps) {
  const reducedMotion = useOpacityReducedMotion();
  const Element = as === 'p' ? m.p : m.div;
  return <Element {...getFadeMotion(kind, reducedMotion)} {...props} />;
}
