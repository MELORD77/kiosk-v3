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
}

interface CaptureDependencies {
  loadModel: () => Promise<void>;
  detect: (canvas: HTMLCanvasElement) => Promise<number>;
  getFrame: () => HTMLCanvasElement | null;
  onState: (state: FaceCaptureState) => void;
  onCapture: (blob: Blob) => void;
  signal?: AbortSignal;
}

let controllerSequence = 0;

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
  let pendingDetection: Promise<number> | undefined;
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

  function publish(status: FaceCaptureStatus, cameraEnabled = true) {
    if (!disposed) deps.onState({ status, cameraEnabled });
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
    if (canvas) {
      canvases.add(canvas);
      try {
        pendingDetection = deps.detect(canvas);
        const count = await pendingDetection;
        if (!capturing) publish(faceStatus(count));
      } catch {
        if (!capturing && !disposed) fail('detectionError');
      } finally {
        pendingDetection = undefined;
        release(canvas);
      }
    }
    if (!disposed && !capturing) timer = setTimeout(() => void poll(), 350);
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
      const count = await deps.detect(canvas);
      if (disposed) return;
      if (count !== 1) {
        publish(faceStatus(count));
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
      if (!disposed) timer = setTimeout(() => void poll(), 350);
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
