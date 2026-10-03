import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveTheme, useThemeStore } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { ThemeIcon } from './theme-icon';
import { styles } from './styles';

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
      className={styles['theme-toggle']}
      aria-label={t('theme.darkMode')}
      aria-pressed={isDark}
      title={actionLabel}
      onClick={() => setPreference(nextTheme)}
    >
      <ThemeIcon theme={nextTheme} />
    </Button>
  );
}
