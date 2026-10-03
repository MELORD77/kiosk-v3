import { cn } from '@/shared/lib/classnames';
import { useState, type ComponentPropsWithRef } from 'react';

import { m } from 'framer-motion';
import { getButtonMotion, useOpacityReducedMotion } from '@/shared/lib/motion';
import { NativeButton } from './native-button';
import { styles } from './styles';

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

const MotionButton = m.create(NativeButton);

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  disabled = false,
  ref,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: ButtonProps) {
  const reducedMotion = useOpacityReducedMotion();
  const [spacePressed, setSpacePressed] = useState(false);
  if (disabled && spacePressed) setSpacePressed(false);
  return (
    <MotionButton
      ref={ref}
      {...getButtonMotion(reducedMotion, disabled, spacePressed)}
      buttonProps={{
        ...props,
        type,
        disabled,
        className: cn(styles.button, styles[`button--${variant}`], className),
        onKeyDown(event) {
          onKeyDown?.(event);
          if (event.key === ' ' && !event.defaultPrevented && !disabled)
            setSpacePressed(true);
        },
        onKeyUp(event) {
          onKeyUp?.(event);
          if (event.key === ' ') setSpacePressed(false);
        },
        onBlur(event) {
          setSpacePressed(false);
          onBlur?.(event);
        },
      }}
    />
  );
}
