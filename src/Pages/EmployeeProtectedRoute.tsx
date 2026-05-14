import { Navigate, Outlet, useLocation } from "react-router-dom";
import { decryptSegment } from "@/utils/segmentEncryption";
import { mapPathToSegment } from "@/utils/segmentMapper";
import {
  buildAdminLoginUrl,
  clearAdminSession,
  getAdminSession,
  getUserRoleFromPayload,
  type JwtPayload,
  type UserRole,
} from "@/lib/api/authSession";

const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN"];
const ALLOWED_ROLES: UserRole[] = ["SERVICE", "AUTHORIZED", ...ADMIN_ROLES];

export default function EmployeeProtectedRoute() {
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  const loginUrl = buildAdminLoginUrl(returnTo);
  const session = getAdminSession();

  if (!session) {
    return <Navigate to={loginUrl} replace />;
  }

  const payload: JwtPayload = session.payload;
  const role = getUserRoleFromPayload(payload);
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
      clearAdminSession();
      return <Navigate to={loginUrl} replace />;
    }
  }

  return <Outlet />;
}
