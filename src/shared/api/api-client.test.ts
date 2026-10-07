import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createApiClient } from './api-client';
import { ApiError, isRetryableApiError } from './api-error';

const labelSchema = z.object({ label: z.string() });
const errorMessageSchema = z
  .object({ message: z.string() })
  .transform(({ message }) => message);

describe('fetch transport', () => {
  it('resolves the configured base URL and validates returned data', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ label: 'Kiosk' })));
    const client = createApiClient({
      baseUrl: 'https://example.test/api',
      fetcher,
    });

    await expect(
      client.request('sample', { schema: labelSchema }),
    ).resolves.toEqual({
      label: 'Kiosk',
    });
    expect(fetcher).toHaveBeenCalledWith('https://example.test/api/sample', {});
  });

  it('accepts no content only when the caller schema accepts undefined', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response(null, { status: 204 }));
    const client = createApiClient({ fetcher });

    await expect(
      client.request('/sample', { schema: z.undefined() }),
    ).resolves.toBeUndefined();
    await expect(
      client.request('/sample', { schema: labelSchema }),
    ).rejects.toMatchObject({
      kind: 'validation',
    });
  });

  it('handles an empty successful body without attempting JSON parsing', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(''));
    await expect(
      createApiClient({ fetcher }).request('/sample', {
        schema: z.undefined(),
      }),
    ).resolves.toBeUndefined();
  });

  it('reports HTTP status without exposing the server error body', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response('private server detail', { status: 503 }),
      );
    await expect(
      createApiClient({ fetcher }).request('/sample', { schema: labelSchema }),
    ).rejects.toMatchObject({
      kind: 'http',
      status: 503,
      message: 'The request failed.',
    });
  });

  it('reports transport failures without exposing their original details', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error('private network detail'));
    await expect(
      createApiClient({ fetcher }).request('/sample', { schema: labelSchema }),
    ).rejects.toMatchObject({
      kind: 'network',
      message: 'The server could not be reached.',
    });
  });

  it('retains only an endpoint-approved error message', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Temporarily unavailable',
          result: 'private',
        }),
        { status: 503 },
      ),
    );
    const error = await createApiClient({ fetcher })
      .request('/sample', { schema: labelSchema, errorMessageSchema })
      .catch((failure: unknown) => failure);
    expect(error).toMatchObject({
      kind: 'http',
      status: 503,
      serverMessage: 'Temporarily unavailable',
      message: 'The request failed.',
    });
    expect(JSON.stringify(error)).not.toContain('private');
    expect(fetcher).toHaveBeenCalledWith('/sample', {});
  });

  it.each(['not JSON', '', JSON.stringify({ message: 5 })])(
    'preserves HTTP errors with malformed error messages: %s',
    async (body) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(body, { status: 503 }));
      await expect(
        createApiClient({ fetcher }).request('/sample', {
          schema: labelSchema,
          errorMessageSchema,
        }),
      ).rejects.toMatchObject({
        kind: 'http',
        status: 503,
        serverMessage: undefined,
      });
    },
  );

  it('preserves HTTP status when reading its error body fails', async () => {
    const response = new Response(null, { status: 503 });
    vi.spyOn(response, 'text').mockRejectedValue(new Error('private'));
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response);
    await expect(
      createApiClient({ fetcher }).request('/sample', {
        schema: labelSchema,
        errorMessageSchema,
      }),
    ).rejects.toMatchObject({
      kind: 'http',
      status: 503,
      serverMessage: undefined,
    });
  });

  it('preserves cancellation while reading an HTTP error body', async () => {
    const controller = new AbortController();
    const response = new Response(null, { status: 503 });
    vi.spyOn(response, 'text').mockImplementation(async () => {
      controller.abort();
      throw new DOMException('Aborted', 'AbortError');
    });
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response);
    await expect(
      createApiClient({ fetcher }).request('/sample', {
        schema: labelSchema,
        errorMessageSchema,
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('preserves a body AbortError even without a caller signal', async () => {
    const response = new Response(null, { status: 503 });
    vi.spyOn(response, 'text').mockRejectedValue(
      new DOMException('Aborted', 'AbortError'),
    );
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response);
    await expect(
      createApiClient({ fetcher }).request('/sample', {
        schema: labelSchema,
        errorMessageSchema,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it.each(['not JSON', JSON.stringify({ label: 4 })])(
    'rejects invalid responses: %s',
    async (body) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(body));
      await expect(
        createApiClient({ fetcher }).request('/sample', {
          schema: labelSchema,
        }),
      ).rejects.toMatchObject({
        kind: 'validation',
      });
    },
  );

  it('preserves cancellation instead of converting it to a retryable error', async () => {
    const controller = new AbortController();
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => {
      controller.abort();
      throw new DOMException('Aborted', 'AbortError');
    });

    await expect(
      createApiClient({ fetcher }).request('/sample', {
        schema: labelSchema,
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('retries only network, rate-limit and server errors', () => {
    expect(isRetryableApiError(new ApiError('network'))).toBe(true);
    expect(isRetryableApiError(new ApiError('http', 429))).toBe(true);
    expect(isRetryableApiError(new ApiError('http', 503))).toBe(true);
    expect(isRetryableApiError(new ApiError('http', 400))).toBe(false);
    expect(isRetryableApiError(new ApiError('validation'))).toBe(false);
    expect(isRetryableApiError(new DOMException('Aborted', 'AbortError'))).toBe(
      false,
    );
  });
});
