import { StrictMode } from 'react';
import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CameraWebcam } from './camera-webcam';

describe('camera lifecycle', () => {
  it('requests permission once in StrictMode and stops a stream arriving after unmount', async () => {
    let resolveStream: (stream: MediaStream) => void = () => undefined;
    const permission = new Promise<MediaStream>((resolve) => {
      resolveStream = resolve;
    });
    const getUserMedia = vi.fn(() => permission);
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia },
      userAgent: 'test',
    });
    vi.stubGlobal(
      'MediaStream',
      class {
        private track = { stop: vi.fn() };
        getTracks() {
          return [this.track];
        }
        getVideoTracks() {
          return [this.track];
        }
        getAudioTracks() {
          return [];
        }
        removeTrack() {}
      },
    );
    const onUserMedia = vi.fn();
    const view = render(
      <StrictMode>
        <CameraWebcam
          audio={false}
          mirrored={false}
          onUserMedia={onUserMedia}
        />
      </StrictMode>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(getUserMedia).toHaveBeenCalledOnce();
    view.unmount();
    const stream = new MediaStream();
    const stop = stream.getTracks()[0]?.stop;
    await act(async () => {
      resolveStream(stream);
      await permission;
    });
    expect(stop).toHaveBeenCalledOnce();
    expect(onUserMedia).not.toHaveBeenCalled();
  });
});
