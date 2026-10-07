import type { FaceBox } from './face-detector';

export type FaceCaptureStatus =
  | 'loading'
  | 'noFace'
  | 'multipleFaces'
  | 'ready'
  | 'capturing'
  | 'captured'
  | 'cancelled'
  | 'permissionDenied'
  | 'cameraUnavailable'
  | 'unsupported'
  | 'modelError'
  | 'detectionError'
  | 'captureError';

export interface FaceCaptureState {
  status: FaceCaptureStatus;
  cameraEnabled: boolean;
  faces: FaceBox[];
  progress: number;
}

interface CaptureDependencies {
  loadModel: () => Promise<void>;
  detect: (canvas: HTMLCanvasElement) => Promise<FaceBox[]>;
  getFrame: () => HTMLCanvasElement | null;
  onState: (state: FaceCaptureState) => void;
  onCapture: (blob: Blob) => void;
  signal?: AbortSignal;
}

let controllerSequence = 0;
const stabilityDuration = 1000;
const pollInterval = 200;

function similarFace(first: FaceBox, second: FaceBox) {
  return (
    Math.abs(first.x + first.width / 2 - second.x - second.width / 2) <= 0.08 &&
    Math.abs(first.y + first.height / 2 - second.y - second.height / 2) <=
      0.08 &&
    Math.abs(first.width - second.width) <= 0.08 &&
    Math.abs(first.height - second.height) <= 0.08
  );
}

function validFace(face: FaceBox) {
  return (
    Object.values(face).every(Number.isFinite) &&
    face.width > 0 &&
    face.height > 0
  );
}

export function stopCameraStream(stream: MediaStream) {
  for (const track of stream.getTracks()) track.stop();
}

function faceStatus(count: number): FaceCaptureStatus {
  if (count === 0) return 'noFace';
  return count === 1 ? 'ready' : 'multipleFaces';
}

function encodeFrame(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not encode camera frame'));
      },
      'image/jpeg',
      0.92,
    );
  });
}

export function createFaceCaptureController(deps: CaptureDependencies) {
  const id = ++controllerSequence;
  let disposed = false;
  let capturing = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pendingDetection: Promise<FaceBox[]> | undefined;
  let stableFace: FaceBox | undefined;
  let stableSince = 0;
  let stableSamples = 0;
  const streams = new Set<MediaStream>();
  const trackListeners = new Map<MediaStreamTrack, () => void>();
  const canvases = new Set<HTMLCanvasElement>();

  function release(canvas: HTMLCanvasElement) {
    canvas.width = 0;
    canvas.height = 0;
    canvases.delete(canvas);
  }

  function dispose() {
    disposed = true;
    clearTimeout(timer);
    deps.signal?.removeEventListener('abort', cancel);
    for (const [track, listener] of trackListeners) {
      track.removeEventListener('ended', listener);
    }
    trackListeners.clear();
    for (const stream of streams) stopCameraStream(stream);
    streams.clear();
    for (const canvas of canvases) release(canvas);
  }

  function publish(
    status: FaceCaptureStatus,
    cameraEnabled = true,
    faces: FaceBox[] = [],
    progress = 0,
  ) {
    if (!disposed) deps.onState({ status, cameraEnabled, faces, progress });
  }

  function resetStability() {
    stableFace = undefined;
    stableSamples = 0;
    stableSince = 0;
  }

  function cancel() {
    publish('cancelled', false);
    dispose();
  }

  function fail(status: FaceCaptureStatus) {
    publish(status, false);
    dispose();
  }

  async function poll() {
    if (disposed || capturing) return;
    const canvas = deps.getFrame();
    let shouldCapture = false;
    if (canvas) {
      canvases.add(canvas);
      try {
        pendingDetection = deps.detect(canvas);
        const faces = await pendingDetection;
        if (disposed || capturing) return;
        const face = faces[0];
        if (faces.length === 1 && face && validFace(face)) {
          if (!stableFace || !similarFace(stableFace, face)) {
            stableFace = face;
            stableSince = Date.now();
            stableSamples = 0;
          }
          stableSamples += 1;
          const progress = Math.min(
            1,
            (Date.now() - stableSince) / stabilityDuration,
          );
          publish('ready', true, faces, progress);
          shouldCapture = progress === 1 && stableSamples >= 3;
        } else {
          resetStability();
          publish(
            faceStatus(faces.length === 1 ? 0 : faces.length),
            true,
            faces,
          );
        }
      } catch {
        if (!capturing && !disposed) fail('detectionError');
      } finally {
        pendingDetection = undefined;
        release(canvas);
      }
    } else {
      resetStability();
      publish('loading');
    }
    // Settle polling detection before capture waits for any in-flight work.
    if (shouldCapture && !disposed) {
      await capture();
      return;
    }
    if (!disposed && !capturing)
      timer = setTimeout(() => void poll(), pollInterval);
  }

  async function start() {
    if (deps.signal?.aborted) {
      cancel();
      return;
    }
    deps.signal?.addEventListener('abort', cancel, { once: true });
    publish('loading', false);
    try {
      await deps.loadModel();
      if (disposed) return;
      publish('loading');
      void poll();
    } catch {
      fail('modelError');
    }
  }

  async function capture() {
    if (disposed || capturing) return;
    capturing = true;
    clearTimeout(timer);
    publish('capturing');
    let canvas: HTMLCanvasElement | null = null;
    try {
      await pendingDetection;
      if (disposed) return;
      canvas = deps.getFrame();
      if (!canvas) {
        fail('captureError');
        return;
      }
      canvases.add(canvas);
      // Verification and encoding share this frozen, unmirrored frame.
      const faces = await deps.detect(canvas);
      if (disposed) return;
      const face = faces[0];
      if (faces.length !== 1 || !face || !validFace(face)) {
        resetStability();
        publish(faceStatus(faces.length === 1 ? 0 : faces.length), true, faces);
        return;
      }
      if (stableFace && !similarFace(stableFace, face)) {
        resetStability();
        publish('ready', true, faces);
        return;
      }
      const blob = await encodeFrame(canvas);
      if (disposed) return;
      publish('captured', false);
      dispose();
      deps.onCapture(blob);
    } catch {
      fail('captureError');
    } finally {
      if (canvas) release(canvas);
      capturing = false;
      if (!disposed) timer = setTimeout(() => void poll(), pollInterval);
    }
  }

  function receiveStream(stream: MediaStream) {
    if (disposed) stopCameraStream(stream);
    else {
      streams.add(stream);
      for (const track of stream.getTracks()) {
        const listener = () => fail('cameraUnavailable');
        track.addEventListener('ended', listener, { once: true });
        trackListeners.set(track, listener);
        if (track.readyState === 'ended') {
          fail('cameraUnavailable');
          return;
        }
      }
    }
  }

  function cameraError(error: string | DOMException) {
    const name = typeof error === 'string' ? error : error.name;
    fail(
      name === 'NotAllowedError' || name === 'PermissionDeniedError'
        ? 'permissionDenied'
        : 'cameraUnavailable',
    );
  }

  return { id, start, capture, cancel, dispose, receiveStream, cameraError };
}
