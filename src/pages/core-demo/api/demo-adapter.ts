import { ApiError } from '@/shared/api';

export type DemoScenario = 'success' | 'empty' | 'error';

export interface DemoProfile {
  id: 'portrait' | 'landscape';
  label: string;
  width: number;
  height: number;
}

export interface DemoLabelResult {
  label: string;
}

function abortableDelay(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();

    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      reject(signal?.reason);
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, 150);

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export async function requestDemoProfiles(
  scenario: DemoScenario,
  signal?: AbortSignal,
): Promise<DemoProfile[]> {
  await abortableDelay(signal);
  signal?.throwIfAborted();

  if (scenario === 'error') throw new ApiError('http', 503);
  if (scenario === 'empty') return [];

  return [
    { id: 'portrait', label: 'Portrait', width: 1080, height: 1920 },
    { id: 'landscape', label: 'Landscape', width: 1920, height: 1080 },
  ];
}

export async function submitDemoLabel(
  input: DemoLabelResult,
  signal?: AbortSignal,
): Promise<DemoLabelResult> {
  await abortableDelay(signal);
  signal?.throwIfAborted();
  const label = input.label.trim();
  if (label.toLowerCase() === 'error') throw new ApiError('http', 503);
  return { label };
}
