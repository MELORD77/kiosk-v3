import type { ComponentPropsWithRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/classnames';
import { useFooterBackRegistration } from '@/shared/lib/back-navigation';
import { ArrowIcon } from '@/shared/ui/arrow-icon';
import { Button } from '@/shared/ui/button';
import { backButtonClassName } from './back-button-styles';

type BackButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children'> & {
  placement?: 'content' | 'footer';
};

export function BackButton({
  className,
  onClick,
  disabled = false,
  placement = 'content',
  ...props
}: BackButtonProps) {
  const { t } = useTranslation();
  const inFooter = useFooterBackRegistration(
    onClick,
    disabled,
    placement === 'content',
  );
  if (inFooter) return null;
  return (
    <Button
      {...props}
      onClick={onClick}
      disabled={disabled}
      variant="primary"
      className={cn(backButtonClassName, className)}
    >
      <span className="flex rotate-180">
        <ArrowIcon />
      </span>
      {t('common.back')}
    </Button>
  );
}
