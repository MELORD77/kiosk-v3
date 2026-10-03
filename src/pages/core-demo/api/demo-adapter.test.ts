import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestDemoProfiles, submitDemoLabel } from './demo-adapter';

afterEach(() => vi.useRealTimers());

describe('development-only demo adapter', () => {
  it('provides both profiles and an explicit empty scenario', async () => {
    vi.useFakeTimers();
    const profiles = requestDemoProfiles('success');
    const empty = requestDemoProfiles('empty');
    await vi.advanceTimersByTimeAsync(150);
    await expect(profiles).resolves.toEqual([
      { id: 'portrait', label: 'Portrait', width: 1080, height: 1920 },
      { id: 'landscape', label: 'Landscape', width: 1920, height: 1080 },
    ]);
    await expect(empty).resolves.toEqual([]);
  });

  it('provides a controllable failure scenario', async () => {
    vi.useFakeTimers();
    const assertion = expect(
      requestDemoProfiles('error'),
    ).rejects.toMatchObject({ kind: 'http', status: 503 });
    await vi.advanceTimersByTimeAsync(150);
    await assertion;
  });

  it('cancels an in-flight request and clears its timer', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const assertion = expect(
      requestDemoProfiles('success', controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rejects requests started with an already aborted signal', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      requestDemoProfiles('success', controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('trims the mutation result and uses the error label as a test convention', async () => {
    vi.useFakeTimers();
    const success = submitDemoLabel({ label: '  Kiosk  ' });
    const failure = expect(
      submitDemoLabel({ label: ' ERROR ' }),
    ).rejects.toMatchObject({ status: 503 });
    await vi.advanceTimersByTimeAsync(150);
    await expect(success).resolves.toEqual({ label: 'Kiosk' });
    await failure;
  });

  it('cancels in-flight mutations', async () => {
    const controller = new AbortController();
    const assertion = expect(
      submitDemoLabel({ label: 'Kiosk' }, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await assertion;
  });
});
