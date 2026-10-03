import { cn } from '@/shared/lib/classnames';

export const styles = {
  'identity-back': cn(
    'identity-back',
    'border-0 border-none bg-kiosk-surface-muted rounded-kiosk-sm text-kiosk-md [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6',
    '[&_svg]:flex-none',
  ),
  'identity-back-arrow': cn(
    'identity-back-arrow',
    'flex [transform:rotate(180deg)]',
  ),
  'identity-continue': cn(
    'identity-continue',
    '[&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 [&_svg]:flex-none col-start-1 row-start-2 self-end w-full',
    "min-h-kiosk-18 mt-auto text-kiosk-lg [&.identity-continue:disabled]:text-kiosk-text-muted [&.identity-continue:disabled]:bg-kiosk-surface-muted [[data-orientation='portrait']_&]:col-auto [[data-orientation='portrait']_&]:row-auto",
    'compact:col-auto compact:row-auto',
  ),
  'identity-copy': cn(
    'identity-copy',
    "min-w-0 flex flex-col gap-kiosk-6 col-start-1 row-start-1 [[data-orientation='portrait']_&]:contents",
    'short:gap-kiosk-4 compact:contents',
  ),
  'identity-entry': cn(
    'identity-entry',
    'min-w-0 flex flex-col gap-kiosk-6 col-start-2 row-start-1 row-span-2',
    "[&_.form-field]:min-w-0 [[data-orientation='portrait']_&]:col-auto [[data-orientation='portrait']_&]:row-auto short:gap-kiosk-4 compact:col-auto compact:row-auto",
  ),
  'identity-form': cn(
    'identity-form',
    'grid grid-cols-[minmax(0,_0.85fr)_minmax(0,_1.15fr)] gap-x-[clamp(var(--space-8),_6vw,_128px)] gap-y-kiosk-6 items-start w-[min(100%,_1600px)] mx-auto',
    "[[data-orientation='portrait']_&]:grid-cols-[1fr] [[data-orientation='portrait']_&]:gap-kiosk-8 [[data-orientation='portrait']_&]:max-w-[800px] compact:grid-cols-[1fr] compact:gap-kiosk-6",
  ),
  'identity-form-skeleton': cn(
    'identity-form-skeleton',
    '[&_.button]:cursor-default',
  ),
  'identity-input': cn(
    'identity-input',
    'min-h-[96px] border-kiosk-primary rounded-kiosk-md text-center text-kiosk-page-heading font-bold tabular-nums',
    'tracking-[0.08em] px-kiosk-3 [&::placeholder]:text-kiosk-text-muted [&::placeholder]:opacity-60 short:min-h-kiosk-18 compact:text-kiosk-lg compact:min-h-kiosk-18',
  ),
  'identity-intro': cn(
    'identity-intro',
    'grid gap-kiosk-3 [&_h2]:text-kiosk-page-heading [&_h2]:font-extrabold [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.025em] [&_p]:text-kiosk-text-muted',
    '[&_p]:text-kiosk-description [&_p]:leading-[1.4]',
  ),
  'identity-key': cn(
    'identity-key',
    'min-h-[96px] border-0 border-none rounded-kiosk-md bg-kiosk-surface-muted text-kiosk-2xl p-kiosk-3',
    '[&_svg]:w-kiosk-8 [&_svg]:h-kiosk-8 short:min-h-kiosk-18 compact:text-kiosk-xl compact:min-h-kiosk-16',
  ),
  'identity-key--action': cn(
    'identity-key--action',
    'text-kiosk-md compact:text-kiosk-sm',
  ),
  'identity-keypad': cn(
    'identity-keypad',
    'grid grid-cols-[repeat(3,_minmax(0,_1fr))] gap-kiosk-3',
  ),
  'identity-keypad--alphabet': cn(
    'identity-keypad--alphabet',
    'grid-cols-[repeat(7,_minmax(0,_1fr))] gap-kiosk-2',
    '[&_.identity-key]:min-h-kiosk-18 [&_.identity-key]:rounded-kiosk-sm [&_.identity-key]:text-kiosk-lg [&_.identity-key]:p-kiosk-2',
    '[&_.identity-key--action]:col-span-2 [&_.identity-key--action]:text-kiosk-sm',
    'compact:grid-cols-[repeat(5,_minmax(0,_1fr))] compact:[&_.identity-key]:min-h-kiosk-12',
  ),
  'identity-methods': cn(
    'identity-methods',
    'flex flex-wrap gap-kiosk-2 [&_.button]:flex-1 [&_.button]:min-w-0 [&_.button]:text-kiosk-description',
  ),
  'identity-navigation': cn(
    'identity-navigation',
    'flex items-center justify-between gap-kiosk-4',
  ),
  'identity-page': cn(
    'identity-page',
    'py-kiosk-8 px-kiosk-page-gutter flex-1 flex short:py-kiosk-6',
  ),
  'identity-passport-fields': cn(
    'identity-passport-fields',
    'grid grid-cols-[minmax(0,_1fr)_minmax(0,_2fr)] gap-kiosk-3',
  ),
  'identity-progress': cn(
    'identity-progress',
    'grid grid-cols-[1fr_1fr] gap-kiosk-2 [&_span]:h-kiosk-2 [&_span]:rounded-kiosk-sm [&_span]:bg-kiosk-border [&_span:first-child]:bg-kiosk-primary',
    '[&_.skeleton]:bg-kiosk-surface-muted',
  ),
  'identity-service-name': cn(
    'identity-service-name',
    'bg-kiosk-primary-soft text-kiosk-primary p-kiosk-4 rounded-kiosk-sm text-kiosk-service-title font-bold leading-[1.4]',
    'wrap-anywhere',
  ),
  'identity-step': cn(
    'identity-step',
    'text-kiosk-text-muted text-kiosk-md font-bold whitespace-nowrap',
  ),
  'placeholder-page': cn(
    'placeholder-page',
    'flex-1 grid content-center gap-kiosk-6',
  ),
} as const;
