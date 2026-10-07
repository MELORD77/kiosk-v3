import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';

interface OperatorCallAudioProps {
  stream: MediaStream;
}

export function OperatorCallAudio({ stream }: OperatorCallAudioProps) {
  const { t } = useTranslation();
  const audio = useRef<HTMLAudioElement>(null);
  const [needsGesture, setNeedsGesture] = useState(false);

  useEffect(() => {
    const element = audio.current;
    if (!element) return;
    let active = true;
    element.srcObject = stream;
    void element.play().then(
      () => {
        if (active) setNeedsGesture(false);
      },
      () => {
        if (active) setNeedsGesture(true);
      },
    );
    return () => {
      active = false;
      element.pause();
      element.srcObject = null;
    };
  }, [stream]);

  async function enableSound() {
    try {
      await audio.current?.play();
      setNeedsGesture(false);
    } catch {
      setNeedsGesture(true);
    }
  }

  return (
    <>
      <audio ref={audio} autoPlay aria-hidden="true" />
      {needsGesture && (
        <div className="flex flex-col gap-kiosk-3">
          <p role="alert" className="text-kiosk-md text-kiosk-text-muted">
            {t('operatorCall.soundBlocked')}
          </p>
          <Button variant="secondary" onClick={() => void enableSound()}>
            {t('operatorCall.enableSound')}
          </Button>
        </div>
      )}
    </>
  );
}
