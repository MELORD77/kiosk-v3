import { useTranslation } from 'react-i18next';
import { BackButton } from '@/shared/ui/back-button';
import { Button } from '@/shared/ui/button';
import { StatusPanel } from '@/shared/ui/status-panel';

interface IdCardReaderScreenProps {
  onBack: () => void;
  onManual: () => void;
}

export function IdCardReaderScreen({
  onBack,
  onManual,
}: IdCardReaderScreenProps) {
  const { t } = useTranslation();

  return (
    <section className="id-card-reader-screen service-flow w-full max-w-360 mx-auto flex flex-col gap-kiosk-6 short:gap-kiosk-3">
      <BackButton className="self-start" onClick={onBack} />
      <div className="grid gap-kiosk-2">
        <h1 className="text-kiosk-page-heading font-extrabold leading-[1.2]">
          {t('serviceFlow.idCardTitle')}
        </h1>
        <p className="text-kiosk-description text-kiosk-text-muted leading-[1.3]">
          {t('serviceFlow.idCardInstruction')}
        </p>
      </div>
      <div className="grid roomy:flex-1 roomy:content-center grid-cols-2 gap-kiosk-6 items-center [[data-orientation='portrait']_&]:grid-cols-1 compact:grid-cols-1">
        <figure className="m-0 grid gap-kiosk-2">
          <img
            className="w-full max-h-kiosk-service-image object-contain compact:hidden"
            src={`${import.meta.env.BASE_URL}images/identity-pinfl-guide.png`}
            alt={t('identity.pinGuideAlt')}
          />
          <figcaption className="text-kiosk-description text-kiosk-text-muted text-center">
            {t('serviceFlow.idCardSample')}
          </figcaption>
        </figure>
        <div className="[&_.status-panel]:p-kiosk-3 [&_.status-panel]:flex-nowrap [&_.status-panel-icon]:hidden">
          <StatusPanel
            title={t('serviceFlow.idCardUnavailableTitle')}
            description={t('serviceFlow.idCardUnavailableDescription')}
          />
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-kiosk-3 [&_.button]:min-h-kiosk-12 [&_.button]:flex-1">
        <Button disabled>{t('serviceFlow.idCardRead')}</Button>
        <Button variant="secondary" onClick={onManual}>
          {t('serviceFlow.manualTitle')}
        </Button>
      </div>
    </section>
  );
}
