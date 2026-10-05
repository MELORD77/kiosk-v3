import { cn } from '@/shared/lib/classnames';
import { useState, type ComponentPropsWithRef } from 'react';

import { m } from 'framer-motion';
import { getButtonMotion, useOpacityReducedMotion } from '@/shared/lib/motion';
import { NativeButton } from './native-button';

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
        className: cn(
          'button border border-solid border-[transparent] rounded-kiosk-sm min-h-[56px] py-kiosk-3 px-kiosk-6 inline-flex items-center justify-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed',
          variant === 'danger' &&
            'button--danger text-kiosk-danger-text bg-kiosk-danger-soft border-kiosk-danger-border',
          variant === 'ghost' &&
            'button--ghost [&:enabled:hover]:bg-kiosk-primary-soft text-kiosk-text bg-[transparent]',
          variant === 'primary' &&
            'button--primary text-kiosk-on-primary bg-kiosk-control-primary border-kiosk-control-primary-border [&:enabled:hover]:bg-none [&:enabled:hover]:bg-kiosk-control-primary-hover [&:disabled]:bg-none [&:disabled]:bg-kiosk-surface-muted [&:disabled]:text-kiosk-text-muted [&:disabled]:border-kiosk-border-strong',
          variant === 'secondary' &&
            'button--secondary text-kiosk-text bg-kiosk-surface border-kiosk-control-border [&:enabled:hover]:border-kiosk-control-primary [&:enabled:focus-visible]:border-kiosk-control-primary',
          className,
        ),
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
