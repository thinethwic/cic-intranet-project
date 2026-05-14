import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  buildAdminLoginUrl,
  expireAdminSession,
  getAdminSession,
  getCurrentReturnTo,
  isProtectedAppPath,
} from "@/lib/api/authSession";

export default function AuthSessionManager() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isProtectedAppPath(location.pathname)) {
      return;
    }

    const session = getAdminSession();
    if (!session) {
      navigate(buildAdminLoginUrl(getCurrentReturnTo()), { replace: true });
    }
  }, [location.pathname, location.search, location.hash, navigate]);

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
        navigate(buildAdminLoginUrl(getCurrentReturnTo()), { replace: true });
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [navigate]);

  return null;
}
