import { Navigate, Outlet, useLocation } from "react-router-dom";
import { decryptSegment } from "@/utils/segmentEncryption";
import { mapPathToSegment } from "@/utils/segmentMapper";

type UserRole = "ADMIN" | "SERVICE" | "AUTHORIZED";

interface JwtPayload {
  exp: number;
  sub: string;
  role?: UserRole;
  roles?: UserRole[];
  location?: string; // ← JWT segment field
}

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
  if (payload.roles && payload.roles.length > 0) return payload.roles[0];
  return null;
}

const ALLOWED_ROLES: UserRole[] = ["SERVICE", "AUTHORIZED", "ADMIN"];

export default function HelpDeskProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("admin_token");
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  // ── No token ─────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <Navigate
        to={`/admin/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  const payload = parseToken(token);

  // ── Invalid token ─────────────────────────────────────────────────────────
  if (!payload) {
    return (
      <Navigate
        to={`/admin/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  // ── Expired token ─────────────────────────────────────────────────────────
  if (isTokenExpired(payload)) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    return (
      <Navigate
        to={`/admin/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  const role = getUserRole(payload);

  // ── Role not allowed ──────────────────────────────────────────────────────
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ── Segment check for non-admins ──────────────────────────────────────────
  if (role !== "ADMIN") {
    const jwtSegment = payload.location;

    const searchParams = new URLSearchParams(location.search);
    const encryptedParam = searchParams.get("s");
    const decryptedParam = encryptedParam
      ? decryptSegment(encryptedParam)
      : null;
    const pathSegment = mapPathToSegment(location.pathname.slice(1));
    const currentSegment = decryptedParam ?? pathSegment ?? null;

    if (!jwtSegment || jwtSegment !== currentSegment) {
      // ← Clear storage before redirecting
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      return (
        <Navigate
          to={`/admin/login?returnTo=${encodeURIComponent(returnTo)}`}
          replace
        />
      );
    }
  }

  return <Outlet />;
}
