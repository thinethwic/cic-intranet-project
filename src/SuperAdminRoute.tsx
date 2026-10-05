// RoleRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { getAdminUser } from "@/lib/api/authHeaders";

type Role = "SUPER_ADMIN" | "ADMIN";

interface Props {
  allowedRoles: Role[];
  redirectTo?: string;
}

function RoleRoute({ allowedRoles, redirectTo = "/admin/ticket" }: Props) {
  const user = getAdminUser();
  const isAllowed = !!user && allowedRoles.includes(user.role as Role);

  return isAllowed ? <Outlet /> : <Navigate to={redirectTo} replace />;
}

export default RoleRoute;
