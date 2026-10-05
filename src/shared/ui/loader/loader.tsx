import { cn } from '@/shared/lib/classnames';

import { useTranslation } from 'react-i18next';

interface LoaderProps {
  className?: string;
}

export function Loader({ className }: LoaderProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'loader flex items-center justify-center gap-kiosk-3 p-kiosk-4 text-kiosk-text-muted font-semibold',
        className,
      )}
      role="status"
      aria-busy="true"
    >
      <span
        className="loader-spinner w-kiosk-8 h-kiosk-8 flex-none border-[length:var(--space-1)] border-solid border-kiosk-border border-t-kiosk-primary rounded-[50%] animate-kiosk-loader"
        aria-hidden="true"
      />
      <span>{t('common.loading')}</span>
    </div>
  );
}
