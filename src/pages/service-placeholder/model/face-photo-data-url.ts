export function facePhotoDataUrl(
  blob: Blob,
  signal: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const cleanup = () => {
      signal.removeEventListener('abort', abort);
      reader.onload = null;
      reader.onerror = null;
      reader.onabort = null;
    };
    const abort = () => {
      cleanup();
      reader.abort();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener('abort', abort, { once: true });
    reader.onload = () => {
      const result = reader.result;
      cleanup();
      if (typeof result !== 'string') {
        reject(new Error('Photo conversion failed'));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => {
      cleanup();
      reject(new Error('Photo conversion failed'));
    };
    reader.onabort = abort;
    reader.readAsDataURL(blob);
  });
}
