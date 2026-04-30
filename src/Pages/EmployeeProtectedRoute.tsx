import { Navigate, Outlet, useLocation } from "react-router-dom";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function EmployeeProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("admin_token");
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  if (!token || isTokenExpired(token)) {
    return (
      <Navigate
        to={`/admin/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  return <Outlet />;
}
