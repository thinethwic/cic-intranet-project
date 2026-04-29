import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AdminSidebar from "./shared/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check immediately on mount
    const check = () => {
      const token = localStorage.getItem("admin_token");
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login", { replace: true });
      }
    };

    check(); // run on mount

    // Then keep checking every 60 seconds
    const interval = setInterval(check, 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50">
        <AdminSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="h-12 border-b bg-white flex items-center px-4 gap-3 shrink-0 shadow-sm">
            <SidebarTrigger className="text-slate-500 hover:text-slate-800" />
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-sm text-slate-500 font-medium">
              Admin Console
            </span>
          </div>

          {/* Page content */}
          <div className="flex-1 p-6 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
