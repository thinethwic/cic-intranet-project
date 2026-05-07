import { Outlet } from "react-router-dom";
import AdminSidebar from "./shared/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-12 border-b bg-white flex items-center px-4 gap-3 shrink-0 shadow-sm">
            <SidebarTrigger className="text-slate-500 hover:text-slate-800" />
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-sm text-slate-500 font-medium">
              Admin Console
            </span>
          </div>
          <div className="flex-1 p-6 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
