import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Loader } from '@/shared/ui/loader';
import { useOperatorCall } from '../model/use-operator-call';
import type { OperatorCallErrorCode } from '../model/operator-call-controller';
import { OperatorCallAudio } from './operator-call-audio';

interface OperatorCallDialogProps {
  open: boolean;
  sessionSignal: AbortSignal;
  onClose: () => void;
}

function errorKey(error: OperatorCallErrorCode | null) {
  switch (error) {
    case 'microphone_denied':
      return 'operatorCall.errors.microphoneDenied';
    case 'microphone_unavailable':
      return 'operatorCall.errors.microphoneUnavailable';
    case 'unsupported':
      return 'operatorCall.errors.unsupported';
    case 'connection_failed':
    case 'timeout':
    case 'connection_timeout':
      return 'operatorCall.errors.connection';
    case 'call_busy':
      return 'operatorCall.errors.busy';
    default:
      return 'operatorCall.errors.unavailable';
  }
}

export function OperatorCallDialog({
  open,
  sessionSignal,
  onClose,
}: OperatorCallDialogProps) {
  const { t } = useTranslation();
  const id = useId();
  const call = useOperatorCall(sessionSignal);
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const isCalling = ['starting', 'ringing', 'connecting', 'connected'].includes(
    call.status,
  );
  const isWaiting = ['starting', 'ringing', 'connecting'].includes(call.status);
  const canStart = !isCalling;
  const startLabel =
    call.status === 'idle' ? t('operatorCall.start') : t('common.retry');

  function close() {
    call.hangup();
    onClose();
  }

  return (
    <Dialog
      open={open}
      titleId={titleId}
      descriptionId={descriptionId}
      onCancel={close}
      className="operator-call-dialog flex-col gap-kiosk-6 compact:p-kiosk-6 short:p-kiosk-4"
    >
      <h2 id={titleId} className="text-kiosk-lg font-bold">
        {t('operatorCall.title')}
      </h2>
      <p
        id={descriptionId}
        className="my-kiosk-4 text-kiosk-md text-kiosk-text-muted"
      >
        {t('operatorCall.handset')}
      </p>
      <div className="my-kiosk-6 rounded-kiosk-sm bg-kiosk-surface-muted p-kiosk-4 text-center">
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-kiosk-md font-semibold"
        >
          {t(`operatorCall.status.${call.status}`)}
        </p>
        {isWaiting && <Loader />}
        {call.status === 'error' && (
          <p
            role="alert"
            className="mt-kiosk-3 text-kiosk-md text-kiosk-danger-text"
          >
            {t(errorKey(call.error))}
          </p>
        )}
      </div>
      {call.remoteStream && <OperatorCallAudio stream={call.remoteStream} />}
      <div className="actions mt-kiosk-6 flex flex-wrap gap-kiosk-3 [&_.button]:flex-1 [&_.button]:min-w-0 [&_.button]:wrap-anywhere">
        <Button variant={isCalling ? 'danger' : 'secondary'} onClick={close}>
          {isCalling ? t('operatorCall.end') : t('operatorCall.close')}
        </Button>
        {canStart && (
          <Button autoFocus onClick={() => void call.start()}>
            {startLabel}
          </Button>
        )}
      </div>
    </Dialog>
  );
}
