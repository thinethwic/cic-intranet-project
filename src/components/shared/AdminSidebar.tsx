import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Video,
  Calendar,
  Image,
  Newspaper,
  Users,
  Ticket,
  BriefcaseBusiness,
  LogOut,
  ChevronRight,
  AlertCircleIcon,
  Activity,
  LayoutGrid,
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
import { getAdminUser, logout } from "@/lib/api/authHeaders";
import logo from "../../assets/Logo.jpg";
import { useState } from "react";

type NavChild = { name: string; path: string };

type NavItem = {
  name: string;
  icon: React.ElementType;
  path: string;
  roles: string[];
  children?: NavChild[];
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Documents",
    icon: FileText,
    path: "/admin/documents",
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Videos",
    icon: Video,
    path: "/admin/videos",
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "News",
    icon: Newspaper,
    path: "/admin/news",
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Alert",
    icon: AlertCircleIcon,
    path: "/admin/alert",
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Events",
    icon: Calendar,
    path: "/admin/events",
    roles: ["SUPER_ADMIN"],
    children: [
      { name: "Events", path: "/admin/events?tab=events" },
      { name: "Announcements", path: "/admin/events?tab=announcements" },
    ],
  },
  {
    name: "Gallery",
    icon: Image,
    path: "/admin/gallery",
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Ticket",
    icon: Ticket,
    path: "/admin/ticket",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Category",
    icon: Ticket,
    path: "/admin/categories",
    roles: ["SUPER_ADMIN"],
    children: [
      { name: "Category", path: "/admin/categories?tab=categories" },
      { name: "Departments", path: "/admin/categories?tab=departments" },
    ],
  },
  {
    name: "Management",
    icon: BriefcaseBusiness,
    path: "/admin/management",
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Users",
    icon: Users,
    path: "/admin/users",
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Audit Logs",
    icon: Activity,
    path: "/admin/auditLog",
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Hero Shortcuts",
    icon: LayoutGrid,
    path: "/admin/hero-shortcuts",
    roles: ["SUPER_ADMIN"],
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const adminUser = getAdminUser();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const initials = adminUser?.name
    ? adminUser.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout("/");
  };

  const role = adminUser?.role ?? "";
  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <Sidebar className="border-r-0 bg-slate-900 text-slate-100">
      <SidebarHeader className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img
              src={logo}
              alt="CIC Intranet"
              className="w-8 h-8 object-contain"
            />
          </Link>
          <div>
            <p className="text-sm font-semibold text-slate-100 leading-none">
              CIC Intranet
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
              {role === "SUPER_ADMIN" ? "Super Admin Console" : "Admin Console"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase px-2 mb-1">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  {item.children ? (
                    <>
                      {/* Parent with submenu */}
                      <SidebarMenuButton
                        onClick={() => toggleMenu(item.name)}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-all duration-150
                          ${
                            isActive(item.path)
                              ? "bg-cic-700 text-white shadow-sm shadow-cic-900/30"
                              : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                          }`}
                      >
                        <item.icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive(item.path)
                              ? "text-white"
                              : "text-slate-500"
                          }`}
                        />
                        <span className="font-medium flex-1 text-left">
                          {item.name}
                        </span>
                        <ChevronRight
                          className={`w-3 h-3 transition-transform duration-200 ${
                            openMenus[item.name] ? "rotate-90" : ""
                          } ${isActive(item.path) ? "text-blue-200" : "text-slate-600"}`}
                        />
                      </SidebarMenuButton>

                      {/* Subitems */}
                      {openMenus[item.name] && (
                        <div className="ml-7 mt-0.5 space-y-0.5">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              className={() => {
                                const childParams = new URLSearchParams(
                                  child.path.split("?")[1] ?? "",
                                );
                                const currentTab = new URLSearchParams(
                                  location.search,
                                ).get("tab");
                                const childTab = childParams.get("tab");
                                const active = childTab
                                  ? currentTab === childTab
                                  : location.pathname === child.path;
                                return `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
    ${
      active
        ? "text-cic-300"
        : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
    }`;
                              }}
                            >
                              <span className="w-1 h-1 rounded-full bg-current opacity-60 shrink-0" />
                              {child.name}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Regular item — no submenu */
                    <SidebarMenuButton
                      isActive={isActive(item.path)}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                        transition-all duration-150
                        ${
                          isActive(item.path)
                            ? "bg-cic-700 text-white shadow-sm shadow-cic-900/30"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                        }`}
                    >
                      <NavLink
                        to={item.path}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive(item.path)
                              ? "text-white"
                              : "text-slate-500"
                          }`}
                        />
                        <span className="font-medium">{item.name}</span>
                        {isActive(item.path) && (
                          <ChevronRight className="w-3 h-3 ml-auto text-blue-200" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="px-4 py-4 border-t border-slate-700/60">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-cic-800/40 text-cic-300 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">
              {adminUser?.name ?? "Admin User"}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {adminUser?.email ?? ""}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
