import type { z } from 'zod';

import { env } from '@/shared/config';

import { ApiError } from './api-error';
import type { ApiServerMessage } from './api-error';

export interface ApiClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export interface ApiRequestOptions<T> extends RequestInit {
  schema: z.ZodType<T>;
  errorMessageSchema?: z.ZodType<ApiServerMessage>;
}

export function createApiClient({
  baseUrl,
  fetcher = fetch,
}: ApiClientOptions = {}) {
  async function request<T>(
    path: string,
    options: ApiRequestOptions<T>,
  ): Promise<T> {
    const { schema, errorMessageSchema, ...requestOptions } = options;
    const url = baseUrl
      ? new URL(path, `${baseUrl.replace(/\/$/, '')}/`).toString()
      : path;
    let response: Response;

    try {
      response = await fetcher(url, requestOptions);
    } catch (error) {
      requestOptions.signal?.throwIfAborted();
      if (error instanceof DOMException && error.name === 'AbortError')
        throw error;
      throw new ApiError('network');
    }

    requestOptions.signal?.throwIfAborted();
    if (!response.ok) {
      let serverMessage: ApiServerMessage | undefined;
      if (errorMessageSchema) {
        try {
          const body: unknown = JSON.parse(await response.text());
          const parsed = errorMessageSchema.safeParse(body);
          if (parsed.success) serverMessage = parsed.data;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError')
            throw error;
          // Preserve the HTTP status even when the error body is unreadable.
        }
      }
      requestOptions.signal?.throwIfAborted();
      throw new ApiError('http', response.status, serverMessage);
    }

    let data: unknown;

    if (response.status !== 204) {
      let body: string;
      try {
        body = await response.text();
      } catch {
        requestOptions.signal?.throwIfAborted();
        throw new ApiError('network');
      }

      requestOptions.signal?.throwIfAborted();
      if (body.trim() !== '') {
        try {
          data = JSON.parse(body);
        } catch {
          throw new ApiError('validation');
        }
      }
    }

    const result = schema.safeParse(data);
    if (!result.success) throw new ApiError('validation');
    return result.data;
  }

  return { request };
}

export const apiClient = createApiClient({
  ...(env.apiBaseUrl ? { baseUrl: env.apiBaseUrl } : {}),
});
