import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';

import { useTranslation } from 'react-i18next';

interface LoaderProps {
  className?: string;
}

export function Loader({ className }: LoaderProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(styles['loader'], className)}
      role="status"
      aria-busy="true"
    >
      <span className={styles['loader-spinner']} aria-hidden="true" />
      <span>{t('common.loading')}</span>
    </div>
  );
}
