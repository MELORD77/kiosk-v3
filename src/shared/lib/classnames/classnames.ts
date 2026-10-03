import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const mergeClasses = extendTailwindMerge<'kiosk-font-size' | 'kiosk-marker'>({
  extend: {
    theme: {
      spacing: [
        'kiosk-1',
        'kiosk-2',
        'kiosk-3',
        'kiosk-4',
        'kiosk-6',
        'kiosk-8',
        'kiosk-10',
        'kiosk-12',
        'kiosk-16',
        'kiosk-18',
        'kiosk-page-gutter',
        'kiosk-footer-height',
        'kiosk-footer-control-height',
        'kiosk-footer-language-width',
        'kiosk-footer-language-gap',
        'kiosk-footer-capsule-padding',
        'kiosk-footer-capsule-gap',
      ],
      radius: [
        'kiosk-sm',
        'kiosk-md',
        'kiosk-lg',
        'kiosk-footer-language-radius',
        'kiosk-footer-pill-radius',
      ],
      shadow: ['kiosk-card'],
    },
    classGroups: {
      'kiosk-marker': ['text-field'],
      // Kiosk font utilities set size only, so they preserve explicit line height.
      'kiosk-font-size': [
        {
          text: [
            'kiosk-xs',
            'kiosk-sm',
            'kiosk-md',
            'kiosk-lg',
            'kiosk-xl',
            'kiosk-2xl',
            'kiosk-brand-republic',
            'kiosk-brand-ministry',
            'kiosk-clock-date',
            'kiosk-page-heading',
            'kiosk-description',
            'kiosk-welcome-title',
            'kiosk-welcome-secondary',
            'kiosk-emergency-number',
            'kiosk-emergency-copy',
            'kiosk-welcome-eyebrow',
            'kiosk-language-name',
            'kiosk-language-code',
            'kiosk-service-title',
            'kiosk-footer-text-size',
            'kiosk-footer-number-size',
          ],
        },
      ],
    },
    conflictingClassGroups: {
      'font-size': ['kiosk-font-size'],
      'kiosk-font-size': ['font-size'],
    },
  },
});

export function cn(...values: ClassValue[]) {
  return mergeClasses(clsx(values));
}
