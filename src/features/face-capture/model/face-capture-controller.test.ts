import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFaceCaptureController } from './face-capture-controller';

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
  const detect = vi.fn(async () => 1);
  const getFrame = vi.fn(() => canvas);
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
  it('blocks a capture when a fresh frozen frame contains multiple faces', async () => {
    const { controller, detect, onCapture, onState, encode } = setup();
    await controller.start();
    await Promise.resolve();
    detect.mockResolvedValueOnce(2);
    await controller.capture();
    expect(onCapture).not.toHaveBeenCalled();
    expect(encode).not.toHaveBeenCalled();
    expect(onState).toHaveBeenLastCalledWith({
      status: 'multipleFaces',
      cameraEnabled: true,
    });
    controller.dispose();
  });

  it('blocks a capture when the only face leaves before the button is pressed', async () => {
    const { controller, detect, onCapture, onState } = setup();
    await controller.start();
    await Promise.resolve();
    detect.mockResolvedValueOnce(0);
    await controller.capture();
    expect(onCapture).not.toHaveBeenCalled();
    expect(onState).toHaveBeenLastCalledWith({
      status: 'noFace',
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
    const pending = deferred<number>();
    detect.mockReturnValueOnce(pending.promise);
    const capture = controller.capture();
    await Promise.resolve();
    abort.abort();
    pending.resolve(1);
    await capture;
    expect(onCapture).not.toHaveBeenCalled();
    expect(onState).toHaveBeenLastCalledWith({
      status: 'cancelled',
      cameraEnabled: false,
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not enable a camera when model loading completes after disposal', async () => {
    const pending = deferred<void>();
    const onState = vi.fn();
    const controller = createFaceCaptureController({
      loadModel: () => pending.promise,
      detect: vi.fn(async () => 1),
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
