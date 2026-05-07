import { Navigate, Outlet } from "react-router-dom";
import { getAdminUser } from "@/lib/api/authHeaders";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function ProtectedRoute() {
  const token = localStorage.getItem("admin_token");
  const user = getAdminUser();

  if (!token) return <Navigate to="/admin/login" replace />;

  if (isTokenExpired(token)) {
    localStorage.removeItem("admin_token");
    return <Navigate to="/admin/login" replace />;
  }

  if (!ADMIN_ROLES.includes(user?.role ?? "")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
