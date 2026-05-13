import { Navigate, Outlet } from "react-router-dom";
import { getAdminUser } from "@/lib/api/authHeaders";

export default function SuperAdminRoute() {
  const user = getAdminUser();
  return user?.role === "SUPER_ADMIN" ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/ticket" replace />
    /* Add */
  );
}
