/**
 * Shared API response contracts for THÉSOROS route handlers and clients.
 */

export type ApiSuccess<T extends Record<string, unknown> = Record<string, unknown>> =
  {
    success: true;
  } & T;

export type ApiFailure = {
  success: false;
  error: string;
  code?: string;
  retryable?: boolean;
  retryAfterMs?: number;
  fields?: Record<string, string[] | undefined>;
};

export type ApiResponse<T extends Record<string, unknown> = Record<string, unknown>> =
  | ApiSuccess<T>
  | ApiFailure;

/** Pagination helpers */
export type PaginationQuery = {
  page?: number;
  limit?: number;
  cursor?: string;
};

export type Paginated<T> = {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
  nextCursor?: string | null;
};

/** Decimal amounts are serialized as strings over the wire */
export type DecimalString = string;

export type IsoDateString = string;
