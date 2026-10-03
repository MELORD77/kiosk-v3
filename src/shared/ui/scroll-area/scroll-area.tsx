import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
import type { HTMLAttributes } from 'react';

interface ScrollAreaProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'nav' | 'main';
}

export function ScrollArea({
  as: Container = 'div',
  className,
  tabIndex = 0,
  ...props
}: ScrollAreaProps) {
  return (
    <Container
      className={cn(styles['scroll-area'], className)}
      tabIndex={tabIndex}
      {...props}
    />
  );
}
