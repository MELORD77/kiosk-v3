import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaceCapture } from '@/features/face-capture';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { ApiError } from '@/shared/api';
import { BackButton } from '@/shared/ui/back-button';
import { Button } from '@/shared/ui/button';
import { Loader } from '@/shared/ui/loader';
import { StatusPanel } from '@/shared/ui/status-panel';
import { localizedServerMessage } from '../model/backend-language';
import { facePhotoDataUrl } from '../model/face-photo-data-url';

interface CitizenFaceVerificationProps {
  serviceName: string;
  onBack: () => void;
  onSubmit: (photo: string, signal: AbortSignal) => Promise<void>;
}

type VerificationStatus =
  { kind: 'camera' | 'pending' } | { kind: 'error'; error: unknown };

export function CitizenFaceVerification({
  serviceName,
  onBack,
  onSubmit,
}: CitizenFaceVerificationProps) {
  const { t, i18n } = useTranslation();
  const sessionSignal = useKioskSessionStore((state) => state.signal);
  const requestController = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<VerificationStatus>({ kind: 'camera' });

  useEffect(() => {
    return () => requestController.current?.abort();
  }, [sessionSignal]);

  async function verify(blob: Blob) {
    if (requestController.current || sessionSignal.aborted) return;
    const controller = new AbortController();
    requestController.current = controller;
    const abortRequest = () => controller.abort();
    sessionSignal.addEventListener('abort', abortRequest, { once: true });
    setStatus({ kind: 'pending' });
    try {
      const photo = await facePhotoDataUrl(blob, controller.signal);
      if (controller.signal.aborted) return;
      await onSubmit(photo, controller.signal);
    } catch (error: unknown) {
      if (!controller.signal.aborted) setStatus({ kind: 'error', error });
    } finally {
      sessionSignal.removeEventListener('abort', abortRequest);
      requestController.current = null;
    }
  }

  const cameraActive = status.kind === 'camera';
  const busy = status.kind === 'pending';
  const failed = status.kind === 'error';
  let description = cameraActive
    ? ''
    : t(`faceVerification.${status.kind}Description`);
  if (status.kind === 'error') {
    const error = status.error;
    const errorKind = error instanceof ApiError ? error.kind : 'photo';
    const serverMessage =
      error instanceof ApiError &&
      !(error.status === 500 && typeof error.serverMessage === 'string')
        ? localizedServerMessage(error.serverMessage, i18n.language)
        : undefined;
    let fallback = t(`faceVerification.${errorKind}Error`);
    if (error instanceof ApiError && error.kind === 'http') {
      if (error.status === 403)
        fallback = t('faceVerification.mismatchDescription');
      if (error.status === 400)
        fallback = t('faceVerification.errorDescription');
    }
    description = serverMessage || fallback;
  }

  return (
    <section
      className="service-flow w-full max-w-360 mx-auto flex flex-col min-w-0 gap-kiosk-6 short:gap-kiosk-4"
      aria-busy={busy}
    >
      <BackButton onClick={onBack} />
      <div className="grid gap-kiosk-3">
        <h1 className="text-kiosk-xl compact:text-kiosk-page-heading font-extrabold leading-[1.2]">
          {t('faceVerification.title')}
        </h1>
        <p className="text-kiosk-md compact:text-kiosk-description text-kiosk-text-muted">
          {serviceName}
        </p>
      </div>
      {!cameraActive && (
        <div className="mx-auto grid w-full max-w-160 overflow-hidden rounded-kiosk-lg border border-kiosk-border bg-kiosk-surface shadow-kiosk-card">
          <div className="grid place-items-center bg-kiosk-primary-soft p-kiosk-6 text-kiosk-primary">
            <svg
              viewBox="0 0 120 120"
              className="size-28 short:size-24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="4"
                width="112"
                height="112"
                rx="32"
                opacity="0.25"
              />
              <path
                d="M36 22H22v14m62-14h14v14M22 84v14h14m62-14v14H84"
                strokeWidth="3"
              />
              <ellipse cx="60" cy="53" rx="17" ry="23" />
              <path d="M35 94c3-22 47-22 50 0" />
            </svg>
          </div>
          <div className="p-kiosk-4 [&_.status-panel]:border-0 [&_.status-panel]:p-kiosk-5 [&_.status-panel]:w-full [&_.status-panel]:flex-col [&_.status-panel]:items-center [&_.status-panel]:text-center [&_.status-panel-content]:w-full [&_.status-panel-actions]:flex [&_.status-panel-actions]:justify-center [&_.status-panel-actions]:pt-kiosk-3">
            <StatusPanel
              title={t(`faceVerification.${status.kind}Title`)}
              description={description}
              tone={failed ? 'error' : 'neutral'}
            >
              {busy ? (
                <Loader />
              ) : (
                <Button
                  onClick={() => {
                    setStatus({ kind: 'camera' });
                  }}
                >
                  {t('faceVerification.retry')}
                </Button>
              )}
            </StatusPanel>
          </div>
        </div>
      )}
      <FaceCapture
        active={cameraActive}
        signal={sessionSignal}
        onCapture={(blob) => void verify(blob)}
        onCancel={onBack}
      />
    </section>
  );
}
