import { describe, expect, it } from 'vitest';
import { cn } from './classnames';

describe('kiosk utility composition', () => {
  it('keeps semantic text color and fluid font size independently', () => {
    expect(cn('text-kiosk-text-muted', 'text-kiosk-description')).toBe(
      'text-kiosk-text-muted text-kiosk-description',
    );
    expect(
      cn(
        'text-kiosk-text-muted text-kiosk-description',
        'text-kiosk-danger text-kiosk-lg',
      ),
    ).toBe('text-kiosk-danger text-kiosk-lg');
  });

  it('lets caller spacing, size and radius replace primitive defaults', () => {
    expect(
      cn(
        'px-kiosk-6 py-kiosk-3 min-h-[56px] rounded-kiosk-sm',
        'p-kiosk-4 min-h-[136px] rounded-kiosk-md',
      ),
    ).toBe('p-kiosk-4 min-h-[136px] rounded-kiosk-md');
    expect(cn('bg-kiosk-primary', 'bg-kiosk-surface')).toBe('bg-kiosk-surface');
  });

  it('preserves distinct responsive and interaction variants', () => {
    expect(
      cn(
        'min-h-[136px] compact:min-h-[48px] [&:hover]:bg-kiosk-primary-soft',
        'min-h-[192px]',
      ),
    ).toBe(
      'compact:min-h-[48px] [&:hover]:bg-kiosk-primary-soft min-h-[192px]',
    );
  });

  it('preserves explicit line height when a caller changes a kiosk font size', () => {
    expect(cn('leading-[1.3] font-bold', 'text-kiosk-description')).toBe(
      'leading-[1.3] font-bold text-kiosk-description',
    );
    expect(cn('leading-[1.3] text-kiosk-md', 'text-kiosk-2xl')).toBe(
      'leading-[1.3] text-kiosk-2xl',
    );
    expect(cn('text-lg', 'text-kiosk-description')).toBe(
      'text-kiosk-description',
    );
    expect(cn('text-kiosk-description', 'text-lg')).toBe('text-lg');
    expect(cn('leading-[1.3]', 'text-lg')).toBe('text-lg');
  });

  it('keeps the text-field marker independently from text color utilities', () => {
    expect(cn('text-field w-full', 'text-kiosk-text')).toBe(
      'text-field w-full text-kiosk-text',
    );
  });
});
