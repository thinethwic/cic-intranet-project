import {
  getStoredAdminToken,
  isTokenExpired,
} from "./authSession";

export { getAdminUser, logout } from "./authSession";

export const authHeaders = (): Record<string, string> => {
  const token = getStoredAdminToken();

  return {
    ...(token && !isTokenExpired(token) ? { Authorization: `Bearer ${token}` } : {}),
  };
};
