import { useTranslation } from 'react-i18next';
import type { CitizenServiceResult } from '@/entities/citizen-service';
import { BackButton } from '@/shared/ui/back-button';
import { ServiceResultView } from './service-result-view';

interface CitizenServiceResultScreenProps {
  data: CitizenServiceResult;
  serviceName: string;
  onBack: () => void;
}

export function CitizenServiceResultScreen({
  data,
  serviceName,
  onBack,
}: CitizenServiceResultScreenProps) {
  const { t } = useTranslation();

  return (
    <section className="service-flow w-full max-w-360 mx-auto flex flex-col min-w-0 gap-kiosk-4">
      <BackButton
        className="self-start min-h-kiosk-16 py-kiosk-3 text-kiosk-lg"
        onClick={onBack}
      />
      <div className="grid min-w-0 gap-kiosk-2">
        <h3 className="font-extrabold leading-[1.2] text-kiosk-2xl compact:text-kiosk-xl wrap-anywhere">
          {serviceName}
        </h3>
        <p className="text-kiosk-text-muted text-kiosk-lg compact:text-kiosk-description">
          {t('serviceResult.title')}
        </p>
      </div>
      <ServiceResultView data={data} />
    </section>
  );
}
