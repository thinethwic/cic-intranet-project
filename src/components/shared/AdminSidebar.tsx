// components/admin/AdminSidebar.tsx

import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Video,
  Calendar,
  Image,
  Newspaper,
  Users,
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

import logo from "../../assets/Logo.jpg";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Documents", icon: FileText, path: "/admin/documents" },
  { name: "Videos", icon: Video, path: "/admin/videos" },
  { name: "News", icon: Newspaper, path: "/admin/news" },
  { name: "Events", icon: Calendar, path: "/admin/events" },
  { name: "Gallery", icon: Image, path: "/admin/gallery" },
  { name: "Management", icon: Users, path: "/admin/management" },
];

export default function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  return (
    <Sidebar className="border-r-0 bg-slate-900 text-slate-100">
      <SidebarHeader className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          {/* ── Logo image ── */}
          <Link to="/">
            <img
              src={logo}
              alt="CIC Intranet"
              className="w-8 h-8 object-contain"
            />
          </Link>

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
                    isActive={isActive(item.path)}
                    className={`
                      group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                      transition-all duration-150
                      ${
                        isActive(item.path)
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "text-slate-400 hover:bg-slate-400 hover:text-slate-100"
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
                            : "text-slate-500 group-hover:text-slate-500"
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
      </SidebarContent>

      {/* ── User Footer ── */}
      <SidebarFooter className="px-4 py-4 border-t border-slate-700/60">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-blue-500/30 text-blue-400 text-xs font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate">
              Admin User
            </p>
            <p className="text-[10px] text-slate-700 truncate">admin@cic.lk</p>
          </div>
          <button className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
