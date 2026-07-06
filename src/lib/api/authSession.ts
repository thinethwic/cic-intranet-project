import { openLoginDialog } from "@/lib/loginDialogStore";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "AUTHORIZED" | "SERVICE";

export interface AdminUser {
  userId: number;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  segment: string | null;
  department: string | null;
}

export interface JwtPayload {
  exp?: number;
  sub?: string;
  userId?: number;
  name?: string;
  email?: string;
  username?: string;
  role?: UserRole;
  roles?: UserRole[];
  segment?: string | null;
  department?: string | null;
  location?: string | null;
}

const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_USER_KEY = "admin_user";

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized.padEnd(normalized.length + (4 - padding), "=");
  return atob(padded);
};

const readStoredAdminUser = (): AdminUser | null => {
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AdminUser>;
    if (!parsed.role) return null;

    return {
      userId: Number(parsed.userId ?? 0),
      name: parsed.name ?? "",
      email: parsed.email ?? "",
      username: parsed.username ?? "",
      role: parsed.role,
      segment: parsed.segment ?? null,
      department: parsed.department ?? null,
    };
  } catch {
    return null;
  }
};

export const getStoredAdminToken = (): string | null =>
  localStorage.getItem(ADMIN_TOKEN_KEY);

export const parseJwtToken = (token: string): JwtPayload | null => {
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
};

export const getUserRoleFromPayload = (
  payload: JwtPayload | null,
): UserRole | null => {
  if (!payload) return null;
  if (payload.role) return payload.role;
  if (payload.roles?.length) return payload.roles[0];
  return null;
};

export const isTokenExpired = (
  tokenOrPayload: string | JwtPayload | null,
  bufferMs = 0,
): boolean => {
  if (!tokenOrPayload) return true;

  const payload =
    typeof tokenOrPayload === "string"
      ? parseJwtToken(tokenOrPayload)
      : tokenOrPayload;

  if (!payload?.exp) return true;
  return payload.exp * 1000 - bufferMs <= Date.now();
};

export const clearAdminSession = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

const normalizeAdminUser = (
  payload: JwtPayload,
  storedUser: AdminUser | null,
): AdminUser | null => {
  const role = getUserRoleFromPayload(payload) ?? storedUser?.role ?? null;
  if (!role) return null;

  return {
    userId: Number(payload.userId ?? storedUser?.userId ?? 0),
    name: payload.name ?? storedUser?.name ?? "",
    email: payload.email ?? storedUser?.email ?? "",
    username: payload.username ?? storedUser?.username ?? payload.sub ?? "",
    role,
    segment: payload.segment ?? payload.location ?? storedUser?.segment ?? null,
    department: payload.department ?? storedUser?.department ?? null,
  };
};

export const getAdminSession = (): {
  token: string;
  payload: JwtPayload;
  user: AdminUser;
} | null => {
  const token = getStoredAdminToken();
  if (!token) return null;

  const payload = parseJwtToken(token);
  if (!payload || isTokenExpired(payload)) {
    clearAdminSession();
    return null;
  }

  const normalizedUser = normalizeAdminUser(payload, readStoredAdminUser());
  if (!normalizedUser) {
    clearAdminSession();
    return null;
  }

  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(normalizedUser));

  return {
    token,
    payload,
    user: normalizedUser,
  };
};

export const getAdminUser = (): AdminUser | null => getAdminSession()?.user ?? null;

export const setAdminSession = (data: {
  token: string;
  userId: number;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  segment?: string | null;
  department?: string | null;
}): void => {
  const user: AdminUser = {
    userId: data.userId,
    name: data.name,
    email: data.email,
    username: data.username,
    role: data.role,
    segment: data.segment ?? null,
    department: data.department ?? null,
  };

  localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
};

export const isProtectedAppPath = (pathname: string): boolean =>
  pathname === "/helpdesk" || pathname.startsWith("/admin");

export const getCurrentReturnTo = (): string =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

export const expireAdminSession = (returnTo = getCurrentReturnTo()): void => {
  clearAdminSession();

  if (!isProtectedAppPath(window.location.pathname)) {
    return;
  }

  openLoginDialog(returnTo);
};

export const logout = async (redirectTo = "/"): Promise<void> => {
  const token = getStoredAdminToken();

  // Call backend to record the logout audit log
  if (token && !isTokenExpired(token)) {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch {
      // Don't block logout if the API call fails
    }
  }

  clearAdminSession();
  window.location.replace(redirectTo);
};
