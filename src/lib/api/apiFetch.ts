import { authHeaders } from "./authHeaders";
import { expireAdminSession } from "./authSession";
import { ApiError } from "./apiUtils";

const REQUEST_TIMEOUT_MS = 15000;

export const apiFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const requestHeaders = new Headers(options.headers ?? {});

  Object.entries(authHeaders()).forEach(([key, value]) => {
    if (!requestHeaders.has(key)) {
      requestHeaders.set(key, value);
    }
  });

  if (typeof options.body === "string" && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let removeAbortListener: (() => void) | undefined;
  if (options.signal) {
    const abortListener = () => controller.abort();
    options.signal.addEventListener("abort", abortListener, { once: true });
    removeAbortListener = () =>
      options.signal?.removeEventListener("abort", abortListener);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: requestHeaders,
      signal: controller.signal,
    });

    if (response.status === 401 || response.status === 403) {
      expireAdminSession();
      throw new ApiError("Your session has expired. Please log in again.", response.status);
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        "The request timed out. Please check your connection and try again.",
      );
    }

    throw new ApiError(
      "Unable to reach the server right now. Please try again in a moment.",
    );
  } finally {
    window.clearTimeout(timeoutId);
    removeAbortListener?.();
  }
};
