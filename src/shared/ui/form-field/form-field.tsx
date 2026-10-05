import type { ReactNode } from 'react';
import { Fade } from '@/shared/ui/fade';

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  hint,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="form-field grid gap-kiosk-2 [&_label]:font-bold">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="muted text-kiosk-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <Fade
          as="p"
          kind="feedback"
          id={`${id}-error`}
          className="field-error text-kiosk-danger"
          role="alert"
        >
          {error}
        </Fade>
      )}
    </div>
  );
}
