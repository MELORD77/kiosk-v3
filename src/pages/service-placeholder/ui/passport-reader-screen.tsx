import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HardwareError,
  stopPassport,
  useReadPassport,
} from '@/entities/kiosk-hardware';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { env } from '@/shared/config';
import { Button } from '@/shared/ui/button';
import { BackButton } from '@/shared/ui/back-button';
import { ArrowIcon } from '@/shared/ui/arrow-icon';
import { StatusPanel, StatusPanelSkeleton } from '@/shared/ui/status-panel';

interface PassportReaderScreenProps {
  onBack: () => void;
  onManual: () => void;
}

function readerErrorKey(error: unknown) {
  if (!(error instanceof HardwareError)) return 'passportReader.error';
  switch (error.code) {
    case 'not_configured':
      return 'serviceFlow.readerUnavailable';
    case 'no_document':
      return 'passportReader.noDocument';
    case 'invalid_mrz':
      return 'passportReader.invalidMrz';
    case 'timeout':
      return 'passportReader.timeout';
    case 'passport_reader_not_found':
    case 'reader_unavailable':
    case 'no_reader':
      return 'passportReader.unavailable';
    default:
      return 'passportReader.error';
  }
}

export function PassportReaderScreen({
  onBack,
  onManual,
}: PassportReaderScreenProps) {
  const { t } = useTranslation();
  const sessionSignal = useKioskSessionStore((state) => state.signal);
  const { mutateAsync, reset, data, error, isPending } = useReadPassport();
  const activeRead = useRef<AbortController | null>(null);
  const stopPending = useRef<Promise<void> | null>(null);
  const mounted = useRef(false);
  const [stopping, setStopping] = useState(false);
  const configured = Boolean(env.hardwareApiBaseUrl);
  const busy = isPending || stopping;

  const stopReader = useCallback(() => {
    if (stopPending.current) return;
    if (mounted.current) setStopping(true);
    const pending = stopPassport()
      .catch(() => {})
      .finally(() => {
        if (stopPending.current === pending) {
          stopPending.current = null;
          if (mounted.current) setStopping(false);
        }
      });
    stopPending.current = pending;
  }, []);

  const cancel = useCallback(() => {
    const controller = activeRead.current;
    activeRead.current = null;
    controller?.abort();
    reset();
    if (controller) stopReader();
  }, [reset, stopReader]);

  useEffect(() => {
    mounted.current = true;
    sessionSignal.addEventListener('abort', cancel, { once: true });
    return () => {
      mounted.current = false;
      sessionSignal.removeEventListener('abort', cancel);
      cancel();
    };
  }, [cancel, sessionSignal]);

  async function startReading() {
    if (
      !configured ||
      activeRead.current ||
      stopPending.current ||
      sessionSignal.aborted
    )
      return;
    const controller = new AbortController();
    activeRead.current = controller;
    reset();
    try {
      await mutateAsync({ signal: controller.signal });
    } catch {
      // The mutation exposes a safe, translated error state.
    } finally {
      if (activeRead.current === controller) {
        activeRead.current = null;
        stopReader();
      }
      if (controller.signal.aborted) reset();
    }
  }

  function leave(next: () => void) {
    cancel();
    next();
  }

  const resultFields = data
    ? [
        { label: t('passportReader.fullName'), value: data.fullName },
        {
          label: t('passportReader.documentNumber'),
          value: data.passportNumber,
        },
        { label: t('identity.birthDateLabel'), value: data.birthDate },
        { label: t('passportReader.nationality'), value: data.nationality },
        { label: t('passportReader.expiryDate'), value: data.expiryDate },
        ...(data.personalNumber
          ? [
              {
                label: t(
                  /^\d{14}$/.test(data.personalNumber)
                    ? 'identity.pinLabel'
                    : 'passportReader.personalNumber',
                ),
                value: data.personalNumber,
              },
            ]
          : []),
      ]
    : [];

  return (
    <section className="service-flow w-full max-w-360 mx-auto flex flex-col gap-kiosk-6 short:gap-kiosk-2">
      <div className="flex items-center gap-kiosk-4 [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6">
        <BackButton onClick={() => leave(onBack)} />
      </div>
      <div className="grid gap-kiosk-1 [&_h1]:text-kiosk-page-heading [&_h1]:font-extrabold [&_h1]:leading-[1.2] [&_p]:text-kiosk-description [&_p]:text-kiosk-text-muted">
        <h1>{t('passportReader.title')}</h1>
        <p>{t('passportReader.instruction')}</p>
      </div>
      <div className="grid roomy:flex-1 roomy:content-center grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-kiosk-8 items-start [[data-orientation='portrait']_&]:grid-cols-1 compact:grid-cols-1">
        <div className="bg-kiosk-surface/50 border border-kiosk-border rounded-kiosk-md p-kiosk-3 grid gap-kiosk-4">
          <img
            className="w-full max-h-[calc(var(--service-image-height)*2)] short-wide:max-h-kiosk-service-image compact:max-h-[16dvh] mx-auto rounded-kiosk-md object-contain"
            src={`${import.meta.env.BASE_URL}images/passport-reader.png`}
            alt={t('serviceFlow.readerImageAlt')}
          />
        </div>
        <div
          className="bg-kiosk-surface border border-kiosk-border rounded-kiosk-md p-kiosk-3 grid gap-kiosk-4 [&_.status-panel]:p-kiosk-3 [&_.status-panel]:gap-kiosk-2 [&_.status-panel]:flex-nowrap [&_.status-panel-content]:gap-kiosk-1 short-wide:[&_.status-panel-icon]:hidden compact:[&_.status-panel-icon]:hidden [&_.status-panel-icon]:w-kiosk-8 [&_.status-panel-icon]:h-kiosk-8"
          aria-busy={busy}
        >
          <p className="text-kiosk-description text-kiosk-text-muted leading-[1.3]">
            {t('serviceFlow.readerVerificationUnavailable')}
          </p>
          {!configured && (
            <StatusPanel
              title={t('serviceFlow.readerUnavailableTitle')}
              description={t('serviceFlow.readerUnavailable')}
            />
          )}
          {configured && !busy && !data && !error && (
            <StatusPanel
              title={t('passportReader.ready')}
              description={t('passportReader.readyDescription')}
            />
          )}
          {busy && (
            <div>
              <p role="status" className="text-kiosk-description">
                {t(
                  stopping
                    ? 'passportReader.stopping'
                    : 'passportReader.reading',
                )}
              </p>
              <StatusPanelSkeleton
                title={t('passportReader.success')}
                description={t('passportReader.instruction')}
              />
            </div>
          )}
          {!busy && error && (
            <StatusPanel
              tone="error"
              title={t('passportReader.errorTitle')}
              description={t(readerErrorKey(error))}
            />
          )}
          {!busy && data && (
            <StatusPanel
              tone="success"
              title={t('passportReader.success')}
              description={t('serviceFlow.verificationNotice')}
            >
              <dl className="grid gap-kiosk-3 text-kiosk-description short-wide:grid-cols-2 compact:grid-cols-2">
                {resultFields.map(({ label, value }) => (
                  <div key={label} className="grid gap-kiosk-1">
                    <dt className="text-kiosk-text-muted">{label}</dt>
                    <dd className="font-bold wrap-anywhere">
                      {value || t('serviceFlow.notProvided')}
                    </dd>
                  </div>
                ))}
              </dl>
            </StatusPanel>
          )}
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-kiosk-4 [&_.button]:min-h-kiosk-18 [&_.button]:text-kiosk-lg [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6">
        <Button
          disabled={!configured || busy}
          className="flex-1"
          onClick={() => {
            void startReading();
          }}
        >
          {t(data ? 'passportReader.readAgain' : 'serviceFlow.startReading')}
        </Button>
        {isPending && (
          <Button variant="secondary" className="flex-1" onClick={cancel}>
            {t('passportReader.cancel')}
          </Button>
        )}
        {data && (
          <Button variant="secondary" className="flex-1" onClick={reset}>
            {t('passportReader.clear')}
          </Button>
        )}
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => leave(onManual)}
        >
          {t('serviceFlow.manualTitle')}
          <ArrowIcon />
        </Button>
      </div>
    </section>
  );
}
