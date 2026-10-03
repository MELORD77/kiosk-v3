import { cn } from '@/shared/lib/classnames';

export const styles = {
  'category-button': cn(
    'category-button',
    'justify-between text-left text-kiosk-description rounded-kiosk-sm py-kiosk-3 px-kiosk-4 min-h-[64px]',
    "[[data-orientation='portrait']_&]:min-h-[56px] [[data-orientation='portrait']_&]:text-kiosk-sm [[data-orientation='portrait']_&]:flex-[1_1_30%] short-wide:min-h-[56px] short-wide:text-kiosk-sm compact:flex-[1_1_45%] compact:min-h-[48px]",
    "compact:text-kiosk-sm compact:p-kiosk-3 compact:[[data-orientation='portrait']_&]:flex-[1_1_45%] compact:[[data-orientation='portrait']_&]:min-h-[48px] compact:[[data-orientation='portrait']_&]:text-kiosk-sm compact:[[data-orientation='portrait']_&]:p-kiosk-3",
  ),
  'category-count': cn('category-count', 'flex-none'),
  'category-skeleton': cn(
    'category-skeleton',
    'justify-between text-left text-kiosk-description rounded-kiosk-sm py-kiosk-3 px-kiosk-4 min-h-[64px]',
    'flex items-center border-2 border-solid border-kiosk-border bg-kiosk-surface cursor-default',
    "[[data-orientation='portrait']_&]:min-h-[56px] compact:flex-[1_1_45%] compact:min-h-[48px] compact:text-kiosk-sm compact:p-kiosk-3 compact:[[data-orientation='portrait']_&]:flex-[1_1_45%] compact:[[data-orientation='portrait']_&]:min-h-[48px]",
    "compact:[[data-orientation='portrait']_&]:text-kiosk-sm compact:[[data-orientation='portrait']_&]:p-kiosk-3",
  ),
  'home-intro': cn(
    'home-intro',
    'flex items-baseline justify-between gap-kiosk-8 [&_.page-heading]:text-kiosk-page-heading [&_.page-subtitle]:mt-0 [&_.page-subtitle]:text-kiosk-description',
    "[&_.page-subtitle]:flex-none [[data-orientation='portrait']_&]:flex-col [[data-orientation='portrait']_&]:gap-kiosk-3 medium:flex-col medium:gap-kiosk-3 short-wide:[&_.page-heading]:text-kiosk-xl",
  ),
  'home-layout': cn(
    'home-layout',
    'grid grid-cols-[minmax(192px,_320px)_minmax(0,_1fr)] grid-rows-[minmax(0,_1fr)] gap-kiosk-6 items-start min-h-0 flex-1',
    "[[data-orientation='portrait']_&]:grid-cols-[1fr] [[data-orientation='portrait']_&]:grid-rows-[auto_minmax(0,_1fr)] medium:gap-kiosk-4 medium:grid-cols-[192px_minmax(0,_1fr)] medium:[[data-orientation='portrait']_&]:grid-cols-[1fr] compact:flex compact:flex-col",
    'compact:min-h-[auto] compact:flex-none',
  ),
  'home-page': cn(
    'home-page',
    'pt-kiosk-4 pb-kiosk-8 px-kiosk-page-gutter min-h-0 flex flex-col flex-1 gap-kiosk-4',
    'short-wide:pb-kiosk-6 compact:flex-none',
  ),
  'service-card': cn(
    'service-card',
    'flex items-stretch justify-start flex-col text-left gap-kiosk-3 p-kiosk-4',
    'min-h-[136px] h-auto self-stretch rounded-kiosk-md border-2 border-solid border-kiosk-border',
    "shadow-kiosk-card [[data-orientation='portrait']_&]:min-h-[192px] medium:min-h-[136px] compact:min-h-[136px] compact:[[data-orientation='portrait']_&]:min-h-[136px]",
  ),
  'service-card-arrow': cn(
    'service-card-arrow',
    'w-kiosk-10 h-kiosk-10 rounded-kiosk-sm bg-kiosk-primary text-kiosk-on-primary flex-none grid',
    'place-items-center [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6',
  ),
  'service-card-meta': cn(
    'service-card-meta',
    'flex items-center min-w-0 gap-kiosk-2',
  ),
  'service-card-skeleton': cn(
    'service-card-skeleton',
    'flex items-stretch justify-start flex-col text-left gap-kiosk-3 p-kiosk-4',
    'min-h-[136px] h-auto self-stretch rounded-kiosk-md border-2 border-solid border-kiosk-border',
    "shadow-kiosk-card bg-kiosk-surface cursor-default [&_.service-card-arrow]:w-kiosk-10 [&_.service-card-arrow]:min-h-kiosk-10 [&_.service-card-arrow]:h-kiosk-10 [[data-orientation='portrait']_&]:min-h-[192px]",
    "medium:min-h-[136px] compact:min-h-[136px] compact:[[data-orientation='portrait']_&]:min-h-[136px]",
  ),
  'service-card-title': cn(
    'service-card-title',
    "text-kiosk-service-title font-semibold leading-[1.3] shrink-0 [[data-orientation='portrait']_&]:text-kiosk-service-title",
  ),
  'service-card-top': cn(
    'service-card-top',
    'flex items-center justify-between gap-kiosk-3 shrink-0',
  ),
  'service-categories': cn(
    'service-categories',
    '[&_>_.status-panel]:flex-col [&_>_.status-panel]:p-kiosk-6 grid gap-kiosk-2 h-full overflow-auto content-start',
    "p-kiosk-1 [&_>_.status-panel]:w-full [&_>_.category-loading]:w-full [[data-orientation='portrait']_&]:flex [[data-orientation='portrait']_&]:flex-wrap [[data-orientation='portrait']_&]:h-auto compact:flex",
    'compact:flex-wrap compact:h-auto compact:flex-none compact:w-full',
  ),
  'service-category': cn(
    'service-category',
    'text-kiosk-text-muted text-kiosk-description font-semibold leading-[1.2]',
  ),
  'service-grid': cn(
    'service-grid',
    'min-h-0 h-full overflow-auto p-kiosk-1 compact:h-auto compact:overflow-visible compact:flex-none',
    'compact:w-full',
  ),
  'service-grid-content': cn(
    'service-grid-content',
    'grid grid-cols-[repeat(2,_minmax(0,_1fr))] auto-rows-[1fr] gap-kiosk-3 compact:grid-cols-[1fr]',
  ),
  'service-grid-loading': cn('service-grid-loading', 'relative'),
  'service-number': cn(
    'service-number',
    'py-kiosk-1 px-kiosk-2 min-w-[44px] min-h-[36px] grid place-items-center flex-none',
    'text-kiosk-md font-extrabold',
  ),
} as const;
