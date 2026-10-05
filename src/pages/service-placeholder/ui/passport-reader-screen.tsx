import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { ArrowIcon } from '@/shared/ui/arrow-icon';

interface PassportReaderScreenProps {
  onBack: () => void;
  onManual: () => void;
}

export function PassportReaderScreen({
  onBack,
  onManual,
}: PassportReaderScreenProps) {
  const { t } = useTranslation();
  return (
    <section className="service-flow w-full max-w-[1440px] mx-auto flex flex-col gap-kiosk-6 short:gap-kiosk-4">
      <div className="flex items-center gap-kiosk-4 [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6">
        <Button variant="secondary" onClick={onBack}>
          <span className="flex rotate-180">
            <ArrowIcon />
          </span>
          {t('common.back')}
        </Button>
      </div>
      <div className="grid gap-kiosk-3 [&_h1]:text-kiosk-page-heading [&_h1]:font-extrabold [&_h1]:leading-[1.2] [&_p]:text-kiosk-description [&_p]:text-kiosk-text-muted">
        <h1>{t('serviceFlow.readerTitle')}</h1>
        <p>{t('serviceFlow.readerInstruction')}</p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-kiosk-8 items-start [[data-orientation='portrait']_&]:grid-cols-1 compact:grid-cols-1">
        <div className="bg-kiosk-surface border border-kiosk-border rounded-kiosk-md p-kiosk-6 grid gap-kiosk-4">
          <img
            className="w-full max-w-[560px] mx-auto rounded-kiosk-md object-contain"
            src={`${import.meta.env.BASE_URL}images/passport-reader.png`}
            alt={t('serviceFlow.readerImageAlt')}
          />
        </div>
        <div className="bg-kiosk-surface border border-kiosk-border rounded-kiosk-md p-kiosk-6 grid gap-kiosk-4">
          <div className="grid gap-kiosk-3 [&_h2]:text-kiosk-service-title [&_h2]:font-bold [&_p]:text-kiosk-description [&_p]:text-kiosk-text-muted [&_p]:leading-[1.5]">
            <h2>{t('serviceFlow.readerUnavailableTitle')}</h2>
            <p>{t('serviceFlow.readerUnavailable')}</p>
            <p>{t('serviceFlow.mrzNotice')}</p>
          </div>
          <div className="flex flex-wrap gap-kiosk-4 [&_.button]:min-h-kiosk-18 [&_.button]:text-kiosk-lg [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6">
            <Button disabled className="w-full">
              {t('serviceFlow.startReading')}
            </Button>
            <Button variant="secondary" className="w-full" onClick={onManual}>
              {t('serviceFlow.manualTitle')}
              <ArrowIcon />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
