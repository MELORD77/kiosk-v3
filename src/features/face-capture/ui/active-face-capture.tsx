import { useEffect, useRef, useState } from 'react';
import type { FaceCaptureProps } from './face-capture';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Loader } from '@/shared/ui/loader';
import { StatusPanel } from '@/shared/ui/status-panel';
import { createFaceCaptureController } from '../model/face-capture-controller';
import type { FaceCaptureState } from '../model/face-capture-controller';
import { detectFaces, loadFaceModel } from '../model/face-detector';
import { CameraWebcam } from './camera-webcam';

const initialState: FaceCaptureState = {
  status: 'loading',
  cameraEnabled: false,
};
const videoConstraints = {
  facingMode: 'user',
  width: { ideal: 1280 },
  height: { ideal: 720 },
};

export function ActiveFaceCapture({
  signal,
  onCapture,
  onCancel,
}: Omit<FaceCaptureProps, 'active'>) {
  const { t } = useTranslation();
  const webcam = useRef<CameraWebcam>(null);
  const onCaptureRef = useRef(onCapture);
  const [state, setState] = useState<FaceCaptureState>(() => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      return { status: 'unsupported', cameraEnabled: false };
    }
    return initialState;
  });
  const [attempt, setAttempt] = useState(0);
  const [controller, setController] = useState<ReturnType<
    typeof createFaceCaptureController
  > | null>(null);

  useEffect(() => {
    onCaptureRef.current = onCapture;
  }, [onCapture]);

  useEffect(() => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      return;
    }
    const current = createFaceCaptureController({
      signal,
      loadModel: loadFaceModel,
      detect: detectFaces,
      getFrame() {
        const video = webcam.current?.video;
        const stream = webcam.current?.stream;
        if (
          !video ||
          video.paused ||
          !stream?.active ||
          !stream
            .getVideoTracks()
            .some((track) => track.readyState === 'live' && !track.muted) ||
          video.readyState < 2 ||
          !video.videoWidth ||
          !video.videoHeight
        )
          return null;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) return null;
        context.drawImage(video, 0, 0);
        return canvas;
      },
      onState: setState,
      onCapture: (blob) => onCaptureRef.current(blob),
    });
    let stopped = false;
    queueMicrotask(() => {
      if (stopped) return;
      setController(current);
      void current.start();
    });
    return () => {
      stopped = true;
      current.dispose();
    };
  }, [signal, attempt]);

  const busy = state.status === 'loading' || state.status === 'capturing';
  const failed =
    state.status.endsWith('Error') ||
    ['permissionDenied', 'cameraUnavailable', 'unsupported'].includes(
      state.status,
    );
  const tone = failed ? 'error' : 'neutral';

  return (
    <section className="grid gap-kiosk-6 min-w-0" aria-label={t('face.title')}>
      <div className="grid gap-kiosk-3">
        <h2 className="text-kiosk-lg font-bold">{t('face.title')}</h2>
        <p className="text-kiosk-text-muted">{t('face.description')}</p>
      </div>
      <div className="aspect-video w-full overflow-hidden rounded-kiosk-md bg-kiosk-surface-muted border border-kiosk-border flex items-center justify-center">
        {state.cameraEnabled && controller ? (
          <CameraWebcam
            key={controller.id}
            ref={webcam}
            audio={false}
            mirrored={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={controller.receiveStream}
            onUserMediaError={controller.cameraError}
            aria-label={t('face.cameraLabel')}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-kiosk-text-muted p-kiosk-6">
            {t(`face.${state.status}`)}
          </span>
        )}
      </div>
      <StatusPanel title={t(`face.${state.status}`)} tone={tone}>
        {busy && <Loader />}
      </StatusPanel>
      <div className="flex flex-wrap gap-kiosk-4">
        <Button
          disabled={state.status !== 'ready'}
          onClick={() => void controller?.capture()}
        >
          {t('face.capture')}
        </Button>
        {failed && state.status !== 'unsupported' && (
          <Button
            variant="secondary"
            onClick={() => setAttempt((value) => value + 1)}
          >
            {t('face.retry')}
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            controller?.cancel();
            onCancel();
          }}
        >
          {t('face.cancel')}
        </Button>
      </div>
    </section>
  );
}
