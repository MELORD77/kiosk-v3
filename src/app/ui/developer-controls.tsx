import { styles } from './styles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { env } from '@/shared/config';
import { useThemeStore } from '@/shared/lib/theme';
import { useOrientationStore } from '@/shared/lib/kiosk';
import { SelectField } from '@/shared/ui/select-field';
import { Button } from '@/shared/ui/button';

export function DeveloperControls() {
  const [isEnabled] = useState(
    () =>
      import.meta.env.DEV &&
      new URLSearchParams(window.location.search).get('devtools') === '1',
  );
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.preference);
  const setTheme = useThemeStore((state) => state.setPreference);
  const orientation = useOrientationStore((state) => state.preference);
  const setOrientation = useOrientationStore((state) => state.setPreference);
  if (!isEnabled) return null;
  return (
    <details className={styles['dev-controls']}>
      <summary>{t('settings.title')}</summary>
      <div className={styles['dev-controls-content']}>
        <label>
          {t('settings.theme')}
          <SelectField
            value={theme}
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'light' || value === 'dark' || value === 'system')
                setTheme(value);
            }}
          >
            {['light', 'dark', 'system'].map((value) => (
              <option key={value} value={value}>
                {t(`settings.${value}`)}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          {t('settings.orientation')}
          <SelectField
            value={orientation}
            disabled={env.kioskOrientation !== 'auto'}
            onChange={(event) => {
              const value = event.target.value;
              if (
                value === 'auto' ||
                value === 'portrait' ||
                value === 'landscape'
              )
                setOrientation(value);
            }}
          >
            {['auto', 'portrait', 'landscape'].map((value) => (
              <option key={value} value={value}>
                {t(`settings.${value}`)}
              </option>
            ))}
          </SelectField>
        </label>
        <Button
          variant="secondary"
          onClick={() => {
            void navigate('/core-demo');
          }}
        >
          {t('settings.demo')}
        </Button>
      </div>
    </details>
  );
}
