import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSyncExternalStore } from "react";
import {
  getAdminSession,
  getUserRoleFromPayload,
  type JwtPayload,
  type UserRole,
} from "@/lib/api/authSession";
import {
  getLoginDialogSnapshot,
  openLoginDialog,
  subscribeLoginDialog,
} from "@/lib/loginDialogStore";

const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN"];
const ALLOWED_ROLES: UserRole[] = ["SERVICE", "AUTHORIZED", ...ADMIN_ROLES];

export default function EmployeeProtectedRoute() {
  const location = useLocation();
  // Re-render whenever the login dialog opens/closes so we notice a session
  // that just appeared, without needing a hard navigation.
  useSyncExternalStore(subscribeLoginDialog, getLoginDialogSnapshot);

  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  const session = getAdminSession();

  useEffect(() => {
    if (!session) openLoginDialog(returnTo);
  }, [session, returnTo]);

  if (!session) {
    return null;
  }

  const payload: JwtPayload = session.payload;
  const role = getUserRoleFromPayload(payload);
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Segment is no longer validated against the URL here. The help desk
  // (and other employee pages) now resolve their own segment from the
  // logged-in user's session/profile internally, so there's nothing in the
  // URL to compare against anymore. Keeping a URL-based check here would
  // incorrectly clear valid sessions whenever the page isn't under a
  // segment-specific path (e.g. a generic /helpdesk route).
  //
  // This route guard's job now is purely: is there a valid session, and
  // does the role have permission to be here.

  return <Outlet />;
}
