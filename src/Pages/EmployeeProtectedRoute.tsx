import { Navigate, Outlet, useLocation } from "react-router-dom";
import { decryptSegment } from "@/utils/segmentEncryption";
import { mapPathToSegment } from "@/utils/segmentMapper";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "SERVICE" | "AUTHORIZED";

interface JwtPayload {
  exp: number;
  sub: string;
  role?: UserRole;
  roles?: UserRole[];
  location?: string;
}

const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN"];
const ALLOWED_ROLES: UserRole[] = ["SERVICE", "AUTHORIZED", ...ADMIN_ROLES];

function parseToken(token: string): JwtPayload | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function isTokenExpired(payload: JwtPayload): boolean {
  return payload.exp * 1000 < Date.now();
}

function getUserRole(payload: JwtPayload): UserRole | null {
  if (payload.role) return payload.role;
  if (payload.roles?.length) return payload.roles[0];
  return null;
}

function clearAuth() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

export default function EmployeeProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("admin_token");
  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  const loginUrl = `/admin/login?returnTo=${encodeURIComponent(returnTo)}`;

  if (!token) return <Navigate to={loginUrl} replace />;

  const payload = parseToken(token);
  if (!payload) return <Navigate to={loginUrl} replace />;

  if (isTokenExpired(payload)) {
    clearAuth();
    return <Navigate to={loginUrl} replace />;
  }

  const role = getUserRole(payload);
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Segment check — skip for SUPER_ADMIN and ADMIN
  if (!ADMIN_ROLES.includes(role)) {
    const searchParams = new URLSearchParams(location.search);
    const encryptedParam = searchParams.get("s");
    const decryptedParam = encryptedParam
      ? decryptSegment(encryptedParam)
      : null;
    const pathSegment = mapPathToSegment(location.pathname.slice(1));
    const currentSegment = decryptedParam ?? pathSegment ?? null;

    if (!payload.location || payload.location !== currentSegment) {
      clearAuth();
      return <Navigate to={loginUrl} replace />;
    }
  }

  return <Outlet />;
}
