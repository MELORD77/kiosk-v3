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
      className="idle-dialog [&_h2]:text-kiosk-lg [&_p]:my-kiosk-4 [&_p]:text-kiosk-md [&_.actions_.button]:flex-1"
      role="alertdialog"
      titleId={titleId}
      descriptionId={descriptionId}
      onCancel={onContinue}
    >
      <h2 id={titleId}>{t('session.title')}</h2>
      <p id={descriptionId}>
        {t('session.description', { count: secondsLeft })}
      </p>
      <div className="actions flex flex-wrap gap-kiosk-3">
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
