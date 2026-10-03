import { textFieldStyles } from '@/shared/ui/text-field';
import { cn } from '@/shared/lib/classnames';
import type { SelectHTMLAttributes } from 'react';

export function SelectField({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(textFieldStyles['text-field'], className)}
      {...props}
    />
  );
}
