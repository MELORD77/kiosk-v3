import { cn } from '@/shared/lib/classnames';
import { useEffect, useRef, type ReactNode } from 'react';

import { m } from 'framer-motion';
import {
  getFadeMotion,
  opacityMotion,
  useOpacityReducedMotion,
} from '@/shared/lib/motion';

interface DialogProps {
  open: boolean;
  titleId: string;
  descriptionId?: string;
  role?: 'dialog' | 'alertdialog';
  className?: string;
  children: ReactNode;
  onCancel: () => void;
}

export function Dialog({
  open,
  titleId,
  descriptionId,
  role = 'dialog',
  className,
  children,
  onCancel,
}: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reducedMotion = useOpacityReducedMotion();
  const fade = getFadeMotion('feedback', reducedMotion);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
    return () => {
      if (element.open) element.close();
    };
  }, [open]);

  return (
    <m.dialog
      ref={dialog}
      className={cn(
        'dialog max-w-[min(600px,_calc(100%_-_var(--space-8)))] max-h-[calc(100dvh_-_var(--space-8))] w-full m-auto overflow-auto border border-solid border-kiosk-border rounded-kiosk-lg bg-kiosk-surface text-kiosk-text p-kiosk-10 [&::backdrop]:bg-kiosk-dialog-backdrop',
        className,
      )}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      initial={false}
      animate={{ opacity: open || reducedMotion ? 1 : opacityMotion.entry }}
      transition={open ? fade.transition : { duration: 0 }}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      {children}
    </m.dialog>
  );
}
