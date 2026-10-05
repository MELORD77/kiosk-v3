import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveTheme, useThemeStore } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { ThemeIcon } from './theme-icon';

const systemThemeQuery = '(prefers-color-scheme: dark)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(systemThemeQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSnapshot() {
  return window.matchMedia(systemThemeQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const { t } = useTranslation();
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  const systemDark = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isDark = resolveTheme(preference, systemDark) === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  const actionLabel = t(`theme.switchTo${isDark ? 'Light' : 'Dark'}`);

  return (
    <Button
      variant="secondary"
      className="theme-toggle flex-none w-kiosk-16 min-h-kiosk-16 p-kiosk-4 rounded-kiosk-sm text-kiosk-control-primary [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 compact:w-[56px] compact:min-h-[56px] compact:p-kiosk-3 compact:rounded-kiosk-sm"
      aria-label={t('theme.darkMode')}
      aria-pressed={isDark}
      title={actionLabel}
      onClick={() => setPreference(nextTheme)}
    >
      <ThemeIcon theme={nextTheme} />
    </Button>
  );
}
