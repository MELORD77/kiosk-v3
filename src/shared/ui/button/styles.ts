import { cn } from '@/shared/lib/classnames';

export const styles = {
  button: cn(
    'button',
    'border-2 border-solid border-[transparent] rounded-kiosk-sm min-h-[56px] py-kiosk-3 px-kiosk-6',
    'inline-flex items-center justify-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3]',
    'no-underline [&:disabled]:cursor-not-allowed',
  ),
  'button--danger': cn(
    'button--danger',
    'text-kiosk-danger-text bg-kiosk-danger-soft border-kiosk-danger-border',
  ),
  'button--ghost': cn(
    'button--ghost',
    '[&:hover]:bg-kiosk-primary-soft text-kiosk-text bg-[transparent]',
  ),
  'button--primary': cn(
    'button--primary',
    'text-kiosk-on-primary bg-kiosk-primary [&:hover]:bg-kiosk-primary-hover',
  ),
  'button--secondary': cn(
    'button--secondary',
    'text-kiosk-text bg-kiosk-surface border-kiosk-border-strong [&:hover]:bg-kiosk-primary-soft',
  ),
} as const;
