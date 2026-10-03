import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';

interface PageHeadingProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeading({
  title,
  description,
  className,
}: PageHeadingProps) {
  return (
    <div className={cn('w-full flex justify-between', className)}>
      <h1 className={styles['page-heading']}>{title}</h1>
      {description && <p className={styles['page-subtitle']}>{description}</p>}
    </div>
  );
}
