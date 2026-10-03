import { cn } from '@/shared/lib/classnames';

export const styles = {
  'circle-arrow': cn(
    'circle-arrow',
    'w-[clamp(48px,_3.6vw,_68px)] h-[clamp(48px,_3.6vw,_68px)] rounded-kiosk-sm bg-kiosk-primary text-kiosk-on-primary grid place-items-center',
    'flex-none [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6',
  ),
  'emergency-banner': cn(
    'emergency-banner',
    'mt-auto flex gap-kiosk-6 items-center py-kiosk-4 px-kiosk-8 bg-kiosk-danger-soft',
    "border-2 border-solid border-kiosk-danger-border rounded-kiosk-md w-full [[data-orientation='portrait']_&]:col-span-full medium:p-kiosk-4",
    'medium:gap-kiosk-3',
  ),
  'emergency-copy': cn(
    'emergency-copy',
    'text-kiosk-danger-text text-kiosk-emergency-copy leading-[1.3]',
  ),
  'emergency-number': cn(
    'emergency-number',
    'text-kiosk-emergency-number font-extrabold text-kiosk-danger leading-[1]',
  ),
  'language-card': cn(
    'language-card',
    'rounded-kiosk-md min-h-[100px] py-kiosk-4 px-kiosk-6 flex justify-between shadow-kiosk-card',
    "text-left [[data-orientation='portrait']_&]:min-h-[112px] medium:p-kiosk-4 compact:min-h-[84px] compact:[[data-orientation='portrait']_&]:min-h-[84px]",
  ),
  'language-card-code': cn(
    'language-card-code',
    "text-kiosk-text-muted text-kiosk-language-code [[data-orientation='portrait']_&]:text-kiosk-language-code compact:text-kiosk-sm compact:[[data-orientation='portrait']_&]:text-kiosk-sm",
  ),
  'language-card-details': cn(
    'language-card-details',
    'flex items-center gap-kiosk-4 medium:gap-kiosk-2',
  ),
  'language-card-name': cn(
    'language-card-name',
    "text-kiosk-language-name font-bold [[data-orientation='portrait']_&]:text-kiosk-language-name compact:text-kiosk-lg compact:[[data-orientation='portrait']_&]:text-kiosk-lg",
  ),
  'language-cards': cn('language-cards', 'grid gap-kiosk-3 flex-none'),
  'welcome-copy': cn(
    'welcome-copy',
    "flex flex-col items-start gap-kiosk-8 [[data-orientation='portrait']_&]:grid [[data-orientation='portrait']_&]:grid-cols-[1fr_1fr] [[data-orientation='portrait']_&]:gap-kiosk-6",
    "[[data-orientation='portrait']_&]:items-end short-wide:gap-kiosk-6 compact:gap-kiosk-4 compact:[[data-orientation='portrait']_&]:grid-cols-[1fr]",
  ),
  'welcome-eyebrow': cn(
    'welcome-eyebrow',
    'text-kiosk-primary text-kiosk-welcome-eyebrow uppercase font-bold tracking-[0.08em]',
  ),
  'welcome-languages': cn('welcome-languages', 'flex flex-col gap-kiosk-4'),
  'welcome-page': cn(
    'welcome-page',
    "flex-1 grid grid-cols-[1fr_1fr] gap-[clamp(var(--space-6),_3.4vw,_var(--space-16))] py-kiosk-12 px-kiosk-page-gutter [[data-orientation='portrait']_&]:grid-cols-[1fr]",
    "[[data-orientation='portrait']_&]:gap-kiosk-8 medium:py-kiosk-6 short-wide:py-kiosk-6 short-wide:gap-kiosk-6 compact:grid-cols-[1fr] compact:gap-kiosk-6",
  ),
  'welcome-page-skeleton': cn(
    'welcome-page-skeleton',
    '[&_.button]:cursor-default',
  ),
  'welcome-title': cn(
    'welcome-title',
    "text-kiosk-welcome-title font-extrabold tracking-[-0.035em] leading-[0.95] max-w-[7ch] [[data-orientation='portrait']_&]:text-kiosk-welcome-title compact:text-kiosk-welcome-title",
    "compact:[[data-orientation='portrait']_&]:text-kiosk-welcome-title",
  ),
  'welcome-translations': cn(
    'welcome-translations',
    "grid gap-kiosk-2 text-kiosk-text-muted text-kiosk-welcome-secondary font-medium [[data-orientation='portrait']_&]:text-kiosk-welcome-secondary compact:text-kiosk-md",
  ),
} as const;
