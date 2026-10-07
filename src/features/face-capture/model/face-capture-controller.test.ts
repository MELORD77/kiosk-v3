import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFaceCaptureController } from './face-capture-controller';
import type { FaceBox } from './face-detector';

const face: FaceBox = { x: 0.3, y: 0.2, width: 0.3, height: 0.4 };

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function setup(signal?: AbortSignal) {
  const canvas = document.createElement('canvas');
  const blob = new Blob(['image'], { type: 'image/jpeg' });
  const encode = vi.fn((callback: BlobCallback) => callback(blob));
  canvas.toBlob = encode;
  const detect = vi.fn(async (): Promise<FaceBox[]> => [face]);
  const getFrame = vi.fn((): HTMLCanvasElement | null => canvas);
  const onCapture = vi.fn();
  const onState = vi.fn();
  const controller = createFaceCaptureController({
    signal,
    loadModel: vi.fn(async () => undefined),
    detect,
    getFrame,
    onCapture,
    onState,
  });
  return {
    controller,
    detect,
    getFrame,
    onCapture,
    onState,
    canvas,
    encode,
    blob,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'MediaStream',
    class {
      private tracks = [
        Object.assign(new EventTarget(), { stop: vi.fn(), readyState: 'live' }),
      ];
      getTracks() {
        return this.tracks;
      }
    },
  );
});
afterEach(() => vi.useRealTimers());

describe('face capture controller', () => {
  it('automatically captures a stable single face exactly once and releases the stream', async () => {
    const { controller, onCapture, encode } = setup();
    const stream = new MediaStream();
    controller.receiveStream(stream);
    await controller.start();
    await vi.advanceTimersByTimeAsync(999);
    expect(onCapture).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onCapture).toHaveBeenCalledOnce();
    expect(encode).toHaveBeenCalledOnce();
    expect(stream.getTracks()[0]?.stop).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(5000);
    expect(onCapture).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([[], [face, face], [{ ...face, x: 0.5 }]])(
    'resets stability after detection changes: %j',
    async (...faces: FaceBox[]) => {
      const { controller, detect, onCapture } = setup();
      await controller.start();
      await vi.advanceTimersByTimeAsync(600);
      detect.mockResolvedValueOnce(faces);
      await vi.advanceTimersByTimeAsync(200);
      await vi.advanceTimersByTimeAsync(1199);
      expect(onCapture).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(onCapture).toHaveBeenCalledOnce();
    },
  );

  it('captures after one second despite modest natural movement', async () => {
    const { controller, detect, onCapture } = setup();
    await controller.start();
    await vi.advanceTimersByTimeAsync(200);
    detect.mockResolvedValue([{ ...face, x: face.x + 0.06 }]);
    await vi.advanceTimersByTimeAsync(799);
    expect(onCapture).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onCapture).toHaveBeenCalledOnce();
  });

  it.each([[], [face, face]])(
    'never automatically captures without a single face: %j',
    async (...faces: FaceBox[]) => {
      const { controller, detect, onCapture, encode } = setup();
      detect.mockResolvedValue(faces);
      await controller.start();
      await vi.advanceTimersByTimeAsync(5000);
      expect(onCapture).not.toHaveBeenCalled();
      expect(encode).not.toHaveBeenCalled();
      controller.dispose();
    },
  );

  it('waits for slow detection without overlapping polls or capturing from two samples', async () => {
    const { controller, detect, onCapture } = setup();
    await controller.start();
    await vi.advanceTimersByTimeAsync(0);
    const pending = deferred<FaceBox[]>();
    detect.mockReturnValueOnce(pending.promise);
    await vi.advanceTimersByTimeAsync(1200);
    expect(detect).toHaveBeenCalledTimes(2);
    expect(onCapture).not.toHaveBeenCalled();
    pending.resolve([face]);
    await vi.advanceTimersByTimeAsync(0);
    expect(onCapture).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(200);
    expect(onCapture).toHaveBeenCalledOnce();
  });

  it('resets stability when no video frame is available', async () => {
    const { controller, getFrame, onCapture } = setup();
    await controller.start();
    await vi.advanceTimersByTimeAsync(600);
    getFrame.mockReturnValueOnce(null);
    await vi.advanceTimersByTimeAsync(1399);
    expect(onCapture).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onCapture).toHaveBeenCalledOnce();
  });

  it('does not encode a frozen frame whose face moved after stability was reached', async () => {
    const { controller, detect, onCapture, encode } = setup();
    await controller.start();
    await vi.advanceTimersByTimeAsync(800);
    detect.mockResolvedValueOnce([face]);
    detect.mockResolvedValueOnce([{ ...face, x: 0.5 }]);
    await vi.advanceTimersByTimeAsync(200);
    expect(encode).not.toHaveBeenCalled();
    expect(onCapture).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1200);
    expect(onCapture).toHaveBeenCalledOnce();
  });

  it('discards automatic capture encoding when the session is aborted', async () => {
    const abort = new AbortController();
    const { controller, encode, onCapture } = setup(abort.signal);
    let finish: BlobCallback | undefined;
    encode.mockImplementation((callback) => {
      finish = callback;
    });
    await controller.start();
    await vi.advanceTimersByTimeAsync(1000);
    expect(encode).toHaveBeenCalledOnce();
    abort.abort();
    finish?.(new Blob(['late'], { type: 'image/jpeg' }));
    await vi.advanceTimersByTimeAsync(5000);
    expect(onCapture).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('blocks a capture when a fresh frozen frame contains multiple faces', async () => {
    const { controller, detect, onCapture, onState, encode } = setup();
    await controller.start();
    await Promise.resolve();
    detect.mockResolvedValueOnce([face, face]);
    await controller.capture();
    expect(onCapture).not.toHaveBeenCalled();
    expect(encode).not.toHaveBeenCalled();
    expect(onState).toHaveBeenLastCalledWith({
      status: 'multipleFaces',
      faces: [face, face],
      progress: 0,
      cameraEnabled: true,
    });
    controller.dispose();
  });

  it('blocks a capture when the only face leaves before the button is pressed', async () => {
    const { controller, detect, onCapture, onState } = setup();
    await controller.start();
    await Promise.resolve();
    detect.mockResolvedValueOnce([]);
    await controller.capture();
    expect(onCapture).not.toHaveBeenCalled();
    expect(onState).toHaveBeenLastCalledWith({
      status: 'noFace',
      faces: [],
      progress: 0,
      cameraEnabled: true,
    });
    controller.dispose();
  });

  it('detects and encodes the same frozen frame and stops the camera after capture', async () => {
    const { controller, detect, getFrame, canvas, onCapture, blob, encode } =
      setup();
    const media = new MediaStream();
    const stop = media.getTracks()[0]?.stop;
    controller.receiveStream(media);
    await controller.capture();
    expect(getFrame).toHaveBeenCalledOnce();
    expect(detect).toHaveBeenCalledWith(canvas);
    expect(encode).toHaveBeenCalledOnce();
    expect(onCapture).toHaveBeenCalledWith(blob);
    expect(stop).toHaveBeenCalledOnce();
    expect(canvas.width).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops a permission result arriving after teardown', () => {
    const { controller } = setup();
    controller.dispose();
    const stream = new MediaStream();
    const stop = stream.getTracks()[0]?.stop;
    controller.receiveStream(stream);
    expect(stop).toHaveBeenCalledOnce();
  });

  it('stops capture when the camera track disconnects', () => {
    const { controller, onState } = setup();
    const stream = new MediaStream();
    controller.receiveStream(stream);
    stream.getTracks()[0]?.dispatchEvent(new Event('ended'));
    expect(onState).toHaveBeenLastCalledWith({
      status: 'cameraUnavailable',
      faces: [],
      progress: 0,
      cameraEnabled: false,
    });
    expect(stream.getTracks()[0]?.stop).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('discards a pending detection after abort and clears timers', async () => {
    const abort = new AbortController();
    const { controller, detect, onCapture, onState } = setup(abort.signal);
    await controller.start();
    await Promise.resolve();
    const pending = deferred<FaceBox[]>();
    detect.mockReturnValueOnce(pending.promise);
    const capture = controller.capture();
    await Promise.resolve();
    abort.abort();
    pending.resolve([face]);
    await capture;
    expect(onCapture).not.toHaveBeenCalled();
    expect(onState).toHaveBeenLastCalledWith({
      status: 'cancelled',
      faces: [],
      progress: 0,
      cameraEnabled: false,
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not enable a camera when model loading completes after disposal', async () => {
    const pending = deferred<void>();
    const onState = vi.fn();
    const controller = createFaceCaptureController({
      loadModel: () => pending.promise,
      detect: vi.fn(async (): Promise<FaceBox[]> => [face]),
      getFrame: () => null,
      onCapture: vi.fn(),
      onState,
    });
    const start = controller.start();
    controller.dispose();
    pending.resolve();
    await start;
    expect(onState).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
