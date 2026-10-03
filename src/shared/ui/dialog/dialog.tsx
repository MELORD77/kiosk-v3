import { styles } from './styles';
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
      className={cn(styles['dialog'], className)}
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
