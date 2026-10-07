export type ApiErrorKind = 'http' | 'network' | 'validation';
export type ApiServerMessage =
  string | { uz: string; cr: string; ru: string; en: string; kk?: string };

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly serverMessage: ApiServerMessage | undefined;

  constructor(
    kind: ApiErrorKind,
    status?: number,
    serverMessage?: ApiServerMessage,
  ) {
    const messages: Record<ApiErrorKind, string> = {
      http: 'The request failed.',
      network: 'The server could not be reached.',
      validation: 'The server returned an invalid response.',
    };

    super(messages[kind]);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

export function isRetryableApiError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.kind === 'network' ||
      (error.kind === 'http' &&
        error.status !== undefined &&
        (error.status === 429 || error.status >= 500)))
  );
}
