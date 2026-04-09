// components/admin/AdminSidebar.tsx

import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Video,
  Calendar,
  Image,
  Users,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Documents", icon: FileText, path: "/admin/documents" },
  { name: "Videos", icon: Video, path: "/admin/videos" },
  { name: "Events", icon: Calendar, path: "/admin/events" },
  { name: "Gallery", icon: Image, path: "/admin/gallery" },
  { name: "Management", icon: Users, path: "/admin/management" },
];

const bottomItems = [
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  return (
    <Sidebar className="border-r-0 bg-slate-900 text-slate-100">
      {/* ── Logo ── */}
      <SidebarHeader className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/30">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black leading-none">
              CIC Intranet
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
              Admin Console
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Main Nav ── */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase px-2 mb-1">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    className={`
                      group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                      transition-all duration-150
                      ${
                        isActive(item.path)
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      }
                    `}
                  >
                    <NavLink
                      to={item.path}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive(item.path)
                            ? "text-black"
                            : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span className="font-medium">{item.name}</span>
                      {isActive(item.path) && (
                        <ChevronRight className="w-3 h-3 ml-auto text-blue-200" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── System ── */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase px-2 mb-1">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all duration-150"
                  >
                    <NavLink
                      to={item.path}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-300" />
                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User Footer ── */}
      <SidebarFooter className="px-4 py-4 border-t border-slate-700/60">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-blue-500/20 text-blue-300 text-xs font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              Admin User
            </p>
            <p className="text-[10px] text-slate-500 truncate">admin@cic.lk</p>
          </div>
          <button className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
