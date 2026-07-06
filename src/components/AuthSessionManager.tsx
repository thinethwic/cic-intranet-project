import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  expireAdminSession,
  getAdminSession,
  getCurrentReturnTo,
  isProtectedAppPath,
} from "@/lib/api/authSession";
import { openLoginDialog } from "@/lib/loginDialogStore";

export default function AuthSessionManager() {
  const location = useLocation();

  useEffect(() => {
    if (!isProtectedAppPath(location.pathname)) {
      return;
    }

    const session = getAdminSession();
    if (!session) {
      openLoginDialog(getCurrentReturnTo());
    }
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const session = getAdminSession();
    if (!session) return;

    const expiresAt = (session.payload.exp ?? 0) * 1000;
    const timeoutMs = Math.max(expiresAt - Date.now(), 0);

    const timeoutId = window.setTimeout(() => {
      expireAdminSession(getCurrentReturnTo());
    }, timeoutMs);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "admin_token" && event.key !== "admin_user") {
        return;
      }

      if (!isProtectedAppPath(window.location.pathname)) {
        return;
      }

      const session = getAdminSession();
      if (!session) {
        openLoginDialog(getCurrentReturnTo());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return null;
}
