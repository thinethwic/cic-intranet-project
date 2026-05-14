import {
  expireAdminSession,
  getStoredAdminToken,
  isTokenExpired,
} from "./authSession";

let isInstalled = false;

const hasAuthorizationHeader = (
  input: RequestInfo | URL,
  init?: RequestInit,
): boolean => {
  const headers = new Headers(init?.headers);

  if (input instanceof Request) {
    input.headers.forEach((value, key) => {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    });
  }

  return headers.has("Authorization");
};

export const installFetchInterceptor = (): void => {
  if (isInstalled) return;
  isInstalled = true;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const hasAuthHeader = hasAuthorizationHeader(input, init);
    const token = getStoredAdminToken();

    if (hasAuthHeader && token && isTokenExpired(token)) {
      expireAdminSession();
      throw new Error("Your session has expired. Please log in again.");
    }

    const response = await nativeFetch(input, init);

    if ((response.status === 401 || response.status === 403) && hasAuthHeader) {
      expireAdminSession();
    }

    return response;
  };
};
