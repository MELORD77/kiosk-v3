import { styles } from './styles';
import { layoutStyles } from '@/shared/lib/ui-styles';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

interface SessionWarningProps {
  open: boolean;
  secondsLeft: number;
  onContinue: () => void;
  onEndSession: () => void;
}

export function SessionWarning({
  open,
  secondsLeft,
  onContinue,
  onEndSession,
}: SessionWarningProps) {
  const { t } = useTranslation();
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  return (
    <Dialog
      open={open}
      className={styles['idle-dialog']}
      role="alertdialog"
      titleId={titleId}
      descriptionId={descriptionId}
      onCancel={onContinue}
    >
      <h2 id={titleId}>{t('session.title')}</h2>
      <p id={descriptionId}>
        {t('session.description', { count: secondsLeft })}
      </p>
      <div className={layoutStyles['actions']}>
        <Button autoFocus onClick={onContinue}>
          {t('session.continue')}
        </Button>
        <Button variant="secondary" onClick={onEndSession}>
          {t('common.finish')}
        </Button>
      </div>
    </Dialog>
  );
}
