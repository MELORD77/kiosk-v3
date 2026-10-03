import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaceCapture } from '@/features/face-capture';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { layoutStyles } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/classnames';
import { Button } from '@/shared/ui/button';
import { PageHeading } from '@/shared/ui/page-heading';

export function FacePreviewPage() {
  const { t } = useTranslation();
  const signal = useKioskSessionStore((state) => state.signal);
  const [active, setActive] = useState(false);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    const element = image.current;
    if (element) element.src = url;
    return () => {
      element?.removeAttribute('src');
      URL.revokeObjectURL(url);
    };
  }, [photo]);

  return (
    <div
      className={cn(
        layoutStyles['page-container'],
        layoutStyles['page-container--narrow'],
        layoutStyles.stack,
      )}
    >
      <PageHeading
        title={t('face.title')}
        description={t('face.previewDescription')}
      />
      {!active && (
        <Button
          onClick={() => {
            setPhoto(null);
            setActive(true);
          }}
        >
          {t('face.start')}
        </Button>
      )}
      <FaceCapture
        active={active}
        signal={signal}
        onCancel={() => setActive(false)}
        onCapture={(blob) => {
          setPhoto(blob);
          setActive(false);
        }}
      />
      {photo && (
        <img
          ref={image}
          className="w-full rounded-kiosk-md"
          alt={t('face.photoAlt')}
        />
      )}
    </div>
  );
}
