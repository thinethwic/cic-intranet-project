import { Navigate, Outlet } from "react-router-dom";
import { getAdminUser } from "@/lib/api/authHeaders";

export default function ProtectedRoute() {
  const token = localStorage.getItem("admin_token");
  const user = getAdminUser();

  // ✅ No token — redirect to login
  if (!token) return <Navigate to="/admin/login" replace />;

  // ✅ Token exists but user is not ADMIN — redirect to home
  if (!user || user.role !== "ADMIN") return <Navigate to="/" replace />;

  return <Outlet />;
}
