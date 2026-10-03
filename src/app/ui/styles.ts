import { cn } from '@/shared/lib/classnames';

export const styles = {
  'brand-ministry': cn(
    'brand-ministry',
    'mt-kiosk-1 text-kiosk-brand-ministry font-bold leading-[1.15]',
  ),
  'brand-republic': cn(
    'brand-republic',
    'text-kiosk-text-muted text-kiosk-brand-republic font-semibold uppercase tracking-[0.06em]',
  ),
  'clock-date': cn('clock-date', 'flex items-center gap-kiosk-3'),
  'clock-day': cn(
    'clock-day',
    'text-kiosk-2xl font-bold tabular-nums leading-none compact:text-kiosk-lg',
  ),
  'clock-calendar-details': cn(
    'clock-calendar-details',
    'flex flex-col gap-kiosk-1',
  ),
  'clock-month-year': cn(
    'clock-month-year',
    'text-kiosk-sm text-kiosk-primary font-semibold uppercase tracking-wide whitespace-nowrap compact:text-kiosk-xs',
  ),
  'clock-weekday': cn(
    'clock-weekday',
    'text-kiosk-xs text-kiosk-text font-semibold capitalize',
  ),
  'clock-time-block': cn(
    'clock-time-block',
    'flex flex-col gap-kiosk-1 border-l border-solid border-kiosk-border pl-kiosk-6 compact:pl-kiosk-4',
  ),
  'clock-time': cn(
    'clock-time',
    'text-kiosk-2xl text-kiosk-primary font-semibold tabular-nums leading-none tracking-tight compact:text-kiosk-lg',
  ),
  'clock-timezone': cn(
    'clock-timezone',
    'text-kiosk-xs text-kiosk-text-muted whitespace-nowrap',
  ),
  'demo-profile': cn(
    'demo-profile',
    'min-h-[96px] p-kiosk-4 rounded-kiosk-md bg-kiosk-surface border border-solid border-kiosk-border',
    'grid gap-kiosk-2 [&_h3]:text-kiosk-md',
  ),
  'demo-profiles': cn(
    'demo-profiles',
    'grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-kiosk-3 compact:grid-cols-[1fr]',
  ),
  'dev-controls': cn(
    'dev-controls',
    'border-t border-dashed border-t-kiosk-border py-kiosk-3 px-kiosk-page-gutter text-kiosk-xs bg-kiosk-surface-muted',
    '[&_summary]:cursor-pointer [&_summary]:min-h-[24px]',
  ),
  'dev-controls-content': cn(
    'dev-controls-content',
    'flex flex-wrap items-end gap-kiosk-4 pt-kiosk-3 [&_label]:grid [&_label]:gap-kiosk-1',
  ),
  'footer-emergency': cn(
    'footer-emergency',
    'flex items-center min-w-0 h-auto min-h-kiosk-footer-control-height max-w-full py-kiosk-2',
    'px-kiosk-footer-capsule-padding border-2 border-solid border-kiosk-danger-border rounded-kiosk-footer-pill-radius gap-kiosk-footer-capsule-gap bg-kiosk-danger-soft',
    'text-kiosk-danger-text text-kiosk-md leading-[1.3] [&_strong]:text-kiosk-danger [&_strong]:text-kiosk-footer-number-size [&_strong]:font-extrabold [&_strong]:tabular-nums',
    "[&_strong]:leading-[1] [&_strong]:flex-none [&_span]:min-w-0 [&_span]:wrap-anywhere [[data-orientation='portrait']_&]:basis-[100%] [[data-orientation='portrait']_&]:order-[1] [[data-orientation='portrait']_&]:justify-center",
    'footer-wrap:basis-[100%] footer-wrap:order-[1] footer-wrap:justify-center compact:h-auto compact:min-h-kiosk-footer-control-height compact:py-kiosk-3 compact:px-kiosk-4',
    'compact:gap-kiosk-3 compact:text-kiosk-sm compact:[&_strong]:text-kiosk-footer-number-size',
  ),
  'footer-finish': cn(
    'footer-finish',
    'flex-none min-h-kiosk-footer-control-height h-auto max-w-full pt-kiosk-2 pr-kiosk-6 pb-kiosk-2',
    'pl-kiosk-4 rounded-kiosk-footer-pill-radius gap-kiosk-3 text-kiosk-footer-text-size font-semibold [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6',
    '[&_svg]:flex-none compact:min-w-0 compact:max-w-full compact:h-auto compact:min-h-[max(48px,_3rem)] compact:px-kiosk-3 compact:gap-kiosk-2',
    'compact:text-kiosk-sm compact:[&_svg]:w-kiosk-6 compact:[&_svg]:h-kiosk-6',
  ),
  'footer-languages': cn(
    'footer-languages',
    'flex items-center flex-none max-w-full flex-wrap gap-kiosk-footer-language-gap [&_.button]:w-kiosk-footer-language-width',
    '[&_.button]:min-h-kiosk-footer-control-height [&_.button]:h-auto [&_.button]:py-kiosk-2 [&_.button]:px-0 [&_.button]:rounded-kiosk-footer-language-radius [&_.button]:text-kiosk-footer-text-size [&_.button]:font-bold',
    "[&_.button]:bg-kiosk-surface-muted [&_.button:hover]:bg-kiosk-primary-soft [&_.button[aria-pressed='true']]:text-kiosk-on-primary [&_.button[aria-pressed='true']]:bg-kiosk-primary compact:[&_.button]:text-kiosk-sm compact:[&_.button]:w-[max(48px,_3rem)] compact:[&_.button]:h-auto",
    'compact:[&_.button]:min-h-[max(48px,_3rem)] compact:[&_.button]:rounded-kiosk-sm compact:gap-kiosk-1',
  ),
  'idle-dialog': cn(
    'idle-dialog',
    '[&_h2]:text-kiosk-lg [&_p]:my-kiosk-4 [&_p]:text-kiosk-md [&_.actions_.button]:flex-1',
  ),
  'kiosk-brand': cn(
    'kiosk-brand',
    'flex items-center gap-kiosk-4 min-w-0 medium:gap-kiosk-3',
  ),
  'kiosk-clock': cn(
    'kiosk-clock',
    'flex items-center gap-kiosk-6 flex-none compact:flex-1 compact:min-w-0 compact:flex-wrap compact:justify-between compact:gap-kiosk-2',
  ),
  'kiosk-header-actions': cn(
    'kiosk-header-actions',
    'flex items-center gap-kiosk-6 flex-none compact:w-full compact:gap-kiosk-3',
  ),
  'kiosk-emblem': cn(
    'kiosk-emblem',
    'w-[64px] h-[64px] flex-none object-contain medium:w-[48px] medium:h-[48px] short-wide:w-[56px]',
    'short-wide:h-[56px] compact:w-[48px] compact:h-[48px]',
  ),
  'kiosk-footer': cn(
    'kiosk-footer',
    'flex-none h-auto min-h-kiosk-footer-height flex justify-between items-center gap-kiosk-4',
    'flex-wrap py-kiosk-2 px-kiosk-page-gutter border-t border-solid border-t-kiosk-border bg-kiosk-surface',
    "[[data-orientation='portrait']_&]:h-auto [[data-orientation='portrait']_&]:flex-wrap [[data-orientation='portrait']_&]:gap-kiosk-4 [[data-orientation='portrait']_&]:py-kiosk-4 footer-wrap:h-auto footer-wrap:flex-wrap footer-wrap:gap-kiosk-4",
    "footer-wrap:py-kiosk-4 compact:gap-kiosk-3 compact:py-kiosk-3 compact:[[data-orientation='portrait']_&]:gap-kiosk-3 compact:[[data-orientation='portrait']_&]:py-kiosk-3",
  ),
  'kiosk-footer-skeleton': cn(
    'kiosk-footer-skeleton',
    '[&_.button]:cursor-default',
  ),
  'kiosk-header': cn(
    'kiosk-header',
    'flex items-center justify-between gap-kiosk-6 min-h-[96px] py-kiosk-3 px-kiosk-page-gutter',
    'bg-kiosk-surface [border-bottom:1px_solid_var(--color-border)] medium:min-h-[80px] medium:gap-kiosk-4 short-wide:min-h-[80px] short-wide:py-kiosk-2 compact:items-start compact:flex-wrap',
  ),
  'kiosk-main': cn(
    'kiosk-main',
    'flex-1 min-h-0 overflow-auto flex flex-col [&_.page-container]:py-kiosk-8 [&_.page-container]:px-kiosk-page-gutter',
    '[&_.page-heading]:text-kiosk-page-heading [&_.page-subtitle]:text-kiosk-description',
  ),
  'kiosk-route': cn(
    'kiosk-route',
    'flex-1 min-h-0 flex flex-col compact:flex-none',
  ),
  'kiosk-shell': cn('kiosk-shell', 'h-[100dvh] min-h-[480px] flex flex-col'),
  'theme-toggle': cn(
    'theme-toggle',
    'flex-none w-kiosk-16 min-h-kiosk-16 p-kiosk-4 rounded-kiosk-sm text-kiosk-primary bg-kiosk-primary-soft border-kiosk-border',
    '[&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 compact:w-[56px] compact:min-h-[56px] compact:p-kiosk-3 compact:rounded-kiosk-sm',
  ),
  'placeholder-page': cn(
    'placeholder-page',
    'flex-1 grid content-center gap-kiosk-6',
  ),
} as const;
