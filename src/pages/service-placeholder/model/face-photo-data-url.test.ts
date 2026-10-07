import { afterEach, describe, expect, it, vi } from 'vitest';
import { facePhotoDataUrl } from './face-photo-data-url';

afterEach(() => vi.restoreAllMocks());

describe('face photo conversion', () => {
  it('converts the captured JPEG into a data URL', async () => {
    const controller = new AbortController();
    await expect(
      facePhotoDataUrl(
        new Blob(['face-photo'], { type: 'image/jpeg' }),
        controller.signal,
      ),
    ).resolves.toBe('data:image/jpeg;base64,ZmFjZS1waG90bw==');
  });

  it('rejects a session that has already ended without reading a photo', async () => {
    const controller = new AbortController();
    controller.abort();
    const read = vi.spyOn(FileReader.prototype, 'readAsDataURL');
    await expect(
      facePhotoDataUrl(new Blob(), controller.signal),
    ).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(read).not.toHaveBeenCalled();
  });

  it('stops an in-progress conversion when the session ends', async () => {
    const controller = new AbortController();
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(
      () => {},
    );
    const abort = vi.spyOn(FileReader.prototype, 'abort');
    const conversion = facePhotoDataUrl(new Blob(), controller.signal);
    controller.abort();
    await expect(conversion).rejects.toMatchObject({ name: 'AbortError' });
    expect(abort).toHaveBeenCalledTimes(1);
  });
});
