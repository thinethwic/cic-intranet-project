import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSyncExternalStore } from "react";
import { getAdminSession } from "@/lib/api/authSession";
import {
  getLoginDialogSnapshot,
  openLoginDialog,
  subscribeLoginDialog,
} from "@/lib/loginDialogStore";

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

export default function ProtectedRoute() {
  const location = useLocation();
  // Re-render whenever the login dialog opens/closes so we notice a session
  // that just appeared, without needing a hard navigation.
  useSyncExternalStore(subscribeLoginDialog, getLoginDialogSnapshot);

  const session = getAdminSession();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (!session) openLoginDialog(returnTo);
  }, [session, returnTo]);

  if (!session) {
    return null;
  }

  if (!ADMIN_ROLES.has(session.user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
