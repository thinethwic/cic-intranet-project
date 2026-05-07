export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getMessageFromPayload = (payload: unknown): string | null => {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (!isObject(payload)) {
    return null;
  }

  for (const key of ["message", "error", "details"] as const) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

export const toApiError = (
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message || fallbackMessage);
  }

  return new ApiError(fallbackMessage);
};

export const getUserFriendlyErrorMessage = (
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
): string => toApiError(error, fallbackMessage).message;

export const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const buildApiError = (
  response: Response,
  payload: unknown,
  fallbackMessage: string,
): ApiError => {
  const message = getMessageFromPayload(payload) ?? fallbackMessage;
  return new ApiError(message, response.status, payload);
};

export const normalizePageResponse = <T>(
  payload: unknown,
  page: number,
  size: number,
): PageResponse<T> => {
  if (Array.isArray(payload)) {
    return {
      content: payload as T[],
      totalElements: payload.length,
      totalPages: payload.length === 0 ? 0 : 1,
      number: page,
      size,
    };
  }

  if (!isObject(payload)) {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: page,
      size,
    };
  }

  const content = Array.isArray(payload.content) ? (payload.content as T[]) : [];
  const totalElements =
    typeof payload.totalElements === "number" ? payload.totalElements : content.length;
  const totalPages =
    typeof payload.totalPages === "number"
      ? payload.totalPages
      : totalElements === 0
        ? 0
        : Math.ceil(totalElements / Math.max(size, 1));
  const currentPage = typeof payload.number === "number" ? payload.number : page;
  const currentSize = typeof payload.size === "number" ? payload.size : size;

  return {
    content,
    totalElements,
    totalPages,
    number: currentPage,
    size: currentSize,
  };
};
