import { cn } from '@/shared/lib/classnames';

export const styles = {
  'field-error': cn('field-error', 'text-kiosk-danger'),
  'form-field': cn('form-field', 'grid gap-kiosk-2 [&_label]:font-bold'),
  'form-field-label': cn('form-field-label', 'font-bold'),
} as const;
