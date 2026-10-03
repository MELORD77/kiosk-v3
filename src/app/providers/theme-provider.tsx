import { useEffect, type ReactNode } from 'react';
import { resolveTheme, useThemeStore } from '@/shared/lib/theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useThemeStore((state) => state.preference);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      document.documentElement.dataset.theme = resolveTheme(
        preference,
        media.matches,
      );
    };
    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [preference]);
  return children;
}
