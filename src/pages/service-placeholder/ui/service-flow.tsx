import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useRequestCitizenService } from '@/entities/citizen-service';
import type { CitizenDocumentInput } from '@/entities/citizen-service';
import type { ServiceDetail } from '@/entities/service-catalog';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { ApiError } from '@/shared/api';
import { clearSessionCache } from '@/shared/lib/query-session';
import { backendLanguage } from '../model/backend-language';
import { emptyIdentityInput } from '../model/identity-schema';
import type { IdentityInput } from '../model/identity-schema';
import { CitizenServiceResultScreen } from './citizen-service-result-screen';
import { IdentityMethodChoice } from './identity-method-choice';
import { PassportReaderScreen } from './passport-reader-screen';
import { ServiceOverview } from './service-overview';
import { CitizenIdentityForm } from './citizen-identity-form';
import { IdCardReaderScreen } from './id-card-reader-screen';
import { CitizenFaceVerification } from './citizen-face-verification';

interface ServiceFlowProps {
  service: ServiceDetail;
  serviceName: string;
  onHome: () => void;
}

type FlowStep =
  'overview' | 'method' | 'manual' | 'reader' | 'id-card' | 'face' | 'result';

export function ServiceFlow({
  service,
  serviceName,
  onHome,
}: ServiceFlowProps) {
  const { i18n } = useTranslation();
  const client = useQueryClient();
  const endSession = useKioskSessionStore((state) => state.endSession);
  const [step, setStep] = useState<FlowStep>('overview');
  const [document, setDocument] = useState<IdentityInput>(() =>
    emptyIdentityInput('passport'),
  );
  const [documentError, setDocumentError] = useState<unknown>();
  const failedAttempts = useRef(0);
  const { mutateAsync, data, reset } = useRequestCitizenService();

  useEffect(() => () => reset(), [reset]);

  function leave() {
    reset();
    clearSessionCache(client);
    onHome();
  }

  async function submitPhoto(photo: string, signal: AbortSignal) {
    if (signal.aborted || failedAttempts.current >= 3) return;
    const input: CitizenDocumentInput =
      document.method === 'pin'
        ? { method: 'PINFL', pinfl: document.pin }
        : {
            method: 'PASSPORT',
            passportSerial: document.passportSeries + document.passportNumber,
            birthDate: document.birthDate,
          };
    try {
      await mutateAsync({
        number: service.number,
        input: { ...input, photo },
        language: backendLanguage(i18n.language),
        signal,
      });
      if (!signal.aborted) setStep('result');
    } catch (error: unknown) {
      if (
        signal.aborted ||
        (error instanceof DOMException && error.name === 'AbortError')
      )
        return;
      reset();
      failedAttempts.current += 1;
      if (failedAttempts.current >= 3) {
        clearSessionCache(client);
        endSession();
        onHome();
        return;
      }
      if (
        error instanceof ApiError &&
        error.kind === 'http' &&
        (error.status === 404 ||
          (error.status === 503 && input.method === 'PINFL'))
      ) {
        setDocumentError(error);
        setStep('manual');
        return;
      }
      throw error;
    }
  }

  if (step === 'face')
    return (
      <CitizenFaceVerification
        serviceName={serviceName}
        onBack={() => {
          reset();
          setStep('manual');
        }}
        onSubmit={submitPhoto}
      />
    );
  if (step === 'result' && data)
    return (
      <CitizenServiceResultScreen
        data={data}
        serviceName={serviceName}
        onBack={leave}
      />
    );
  if (step === 'overview')
    return (
      <ServiceOverview
        service={service}
        serviceName={serviceName}
        onBack={leave}
        onContinue={() => setStep('method')}
      />
    );
  if (step === 'method')
    return (
      <IdentityMethodChoice
        serviceName={serviceName}
        onBack={() => setStep('overview')}
        onManual={() => setStep('manual')}
        onReader={() => setStep('reader')}
        onIdCard={() => setStep('id-card')}
      />
    );
  if (step === 'reader')
    return (
      <PassportReaderScreen
        onBack={() => setStep('method')}
        onManual={() => setStep('manual')}
      />
    );
  if (step === 'id-card')
    return (
      <IdCardReaderScreen
        onBack={() => setStep('method')}
        onManual={() => setStep('manual')}
      />
    );
  return (
    <CitizenIdentityForm
      serviceName={serviceName}
      initialValues={document}
      error={documentError}
      onChange={() => setDocumentError(undefined)}
      onBack={() => {
        setDocument(emptyIdentityInput('passport'));
        setDocumentError(undefined);
        setStep('method');
      }}
      onSubmit={(values) => {
        setDocument(values);
        setDocumentError(undefined);
        if ([7, 8, 12, 22].includes(service.number)) setStep('face');
      }}
    />
  );
}
