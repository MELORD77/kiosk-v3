import { useEffect, useRef, useState } from 'react';
import type { FaceCaptureProps } from './face-capture';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { StatusPanel } from '@/shared/ui/status-panel';
import { createFaceCaptureController } from '../model/face-capture-controller';
import type { FaceCaptureState } from '../model/face-capture-controller';
import { detectFaces, loadFaceModel } from '../model/face-detector';
import { CameraWebcam } from './camera-webcam';
import { FaceOverlay } from './face-overlay';

const initialState: FaceCaptureState = {
  status: 'loading',
  cameraEnabled: false,
  faces: [],
  progress: 0,
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
      return { ...initialState, status: 'unsupported' };
    }
    return initialState;
  });
  const [attempt, setAttempt] = useState(0);
  const [videoAspectRatio, setVideoAspectRatio] = useState(16 / 9);
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
        const frameAspectRatio = Math.min(
          video.videoWidth / video.videoHeight,
          4 / 3,
        );
        const frameWidth = Math.min(
          video.videoWidth,
          video.videoHeight * frameAspectRatio,
        );
        const frameHeight = Math.min(
          video.videoHeight,
          video.videoWidth / frameAspectRatio,
        );
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(frameWidth);
        canvas.height = Math.round(frameHeight);
        const context = canvas.getContext('2d');
        if (!context) return null;
        context.drawImage(
          video,
          (video.videoWidth - frameWidth) / 2,
          (video.videoHeight - frameHeight) / 2,
          frameWidth,
          frameHeight,
          0,
          0,
          canvas.width,
          canvas.height,
        );
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

  useEffect(() => {
    const video = webcam.current?.video;
    if (!video) return;
    const updateAspectRatio = () => {
      if (video.videoWidth && video.videoHeight) {
        setVideoAspectRatio(video.videoWidth / video.videoHeight);
      }
    };
    video.addEventListener('resize', updateAspectRatio);
    return () => video.removeEventListener('resize', updateAspectRatio);
  }, [state.cameraEnabled, controller]);

  const failed =
    state.status.endsWith('Error') ||
    ['permissionDenied', 'cameraUnavailable', 'unsupported'].includes(
      state.status,
    );
  const tone = failed ? 'error' : 'neutral';
  const previewAspectRatio = Math.min(videoAspectRatio, 4 / 3);

  return (
    <section
      className="mx-auto grid w-full min-w-0 overflow-hidden rounded-kiosk-lg border border-kiosk-border bg-kiosk-surface shadow-kiosk-card"
      style={{ maxWidth: `min(40rem, ${previewAspectRatio * 48}dvh)` }}
      aria-label={t('face.title')}
    >
      <div
        className="relative w-full overflow-hidden bg-kiosk-surface-muted"
        style={{ aspectRatio: previewAspectRatio }}
      >
        {state.cameraEnabled && controller ? (
          <>
            <CameraWebcam
              key={controller.id}
              ref={webcam}
              audio={false}
              mirrored={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={controller.receiveStream}
              onUserMediaError={controller.cameraError}
              onLoadedMetadata={(event) => {
                const video = event.currentTarget;
                if (video.videoWidth && video.videoHeight) {
                  setVideoAspectRatio(video.videoWidth / video.videoHeight);
                }
              }}
              aria-label={t('face.cameraLabel')}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <FaceOverlay faces={state.faces} progress={state.progress} />
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center p-kiosk-6 text-kiosk-text-muted text-center">
            <svg
              viewBox="0 0 64 64"
              className="w-kiosk-18 h-kiosk-18 text-kiosk-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M20 8H8v12m36-12h12v12M8 44v12h12m36-12v12H44" />
              <ellipse cx="32" cy="28" rx="10" ry="13" />
              <path d="M17 51c2-12 28-12 30 0" />
            </svg>
          </div>
        )}
      </div>
      <div
        className="h-kiosk-1 overflow-hidden bg-kiosk-border"
        role="progressbar"
        aria-label={t('face.stability')}
        aria-valuenow={Math.round(state.progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full origin-left bg-kiosk-success"
          style={{ transform: `scaleX(${state.progress})` }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-kiosk-4 p-kiosk-4 [&_.status-panel]:border-0 [&_.status-panel]:p-0 [&_.status-panel]:bg-transparent [&_.status-panel]:flex-nowrap [&_.status-panel-icon]:size-10 [&_.status-panel-content]:gap-kiosk-1 [&_.status-panel-content_h2]:text-kiosk-sm">
        <div className="min-w-0 flex-1 basis-48">
          <StatusPanel title={t(`face.${state.status}`)} tone={tone} />
        </div>
        <div className="flex flex-wrap gap-kiosk-3">
          {failed && state.status !== 'unsupported' && (
            <Button onClick={() => setAttempt((value) => value + 1)}>
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
      </div>
    </section>
  );
}
