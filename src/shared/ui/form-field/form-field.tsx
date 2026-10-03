import { styles } from './styles';
import { layoutStyles } from '@/shared/lib/ui-styles';
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
    <div className={styles['form-field']}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className={layoutStyles['muted']}>
          {hint}
        </p>
      )}
      {error && (
        <Fade
          as="p"
          kind="feedback"
          id={`${id}-error`}
          className={styles['field-error']}
          role="alert"
        >
          {error}
        </Fade>
      )}
    </div>
  );
}
