import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
import type { InputHTMLAttributes } from 'react';

export function TextField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(styles['text-field'], className)} {...props} />;
}
