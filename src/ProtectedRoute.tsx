import { Navigate, Outlet } from "react-router-dom";
import { getAdminUser } from "@/lib/api/authHeaders";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 840000 < Date.now(); // exp is in seconds, Date.now() is ms
  } catch {
    return true; // if we can't decode it, treat as expired
  }
}

export default function ProtectedRoute() {
  const token = localStorage.getItem("admin_token");
  const user = getAdminUser();

  // No token
  if (!token) return <Navigate to="/admin/login" replace />;

  // Token expired — clear it and redirect
  if (isTokenExpired(token)) {
    localStorage.removeItem("admin_token");
    return <Navigate to="/admin/login" replace />;
  }

  // Token exists but user is not ADMIN
  if (!user || user.role !== "ADMIN") return <Navigate to="/" replace />;

  return <Outlet />;
}
