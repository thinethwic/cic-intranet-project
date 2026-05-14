import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  buildAdminLoginUrl,
  getAdminSession,
} from "@/lib/api/authSession";

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

export default function ProtectedRoute() {
  const location = useLocation();
  const session = getAdminSession();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  if (!session) {
    return <Navigate to={buildAdminLoginUrl(returnTo)} replace />;
  }

  if (!ADMIN_ROLES.has(session.user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
