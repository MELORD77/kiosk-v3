import { useState } from 'react';
import type { ServiceDetail } from '@/entities/service-catalog';
import { IdentityForm } from './identity-form';
import { IdentityMethodChoice } from './identity-method-choice';
import { PassportReaderScreen } from './passport-reader-screen';
import { ServiceOverview } from './service-overview';

interface ServiceFlowProps {
  service: ServiceDetail;
  serviceName: string;
  onHome: () => void;
}

export function ServiceFlow({
  service,
  serviceName,
  onHome,
}: ServiceFlowProps) {
  const [step, setStep] = useState<'overview' | 'method' | 'manual' | 'reader'>(
    'overview',
  );
  if (step === 'overview')
    return (
      <ServiceOverview
        service={service}
        serviceName={serviceName}
        onBack={onHome}
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
      />
    );
  if (step === 'reader')
    return (
      <PassportReaderScreen
        onBack={() => setStep('method')}
        onManual={() => setStep('manual')}
      />
    );
  return (
    <IdentityForm serviceName={serviceName} onBack={() => setStep('method')} />
  );
}
