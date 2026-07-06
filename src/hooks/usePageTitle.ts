import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_TITLES: Record<string, string> = {
    "/": "Home",
    "/our-segments/cic-feeds": "CIC Feeds",
    "/our-segments/cic-vetcare": "CIC Vetcare",
    "/our-segments/cic-poulry": "CIC Poultry",
    "/our-segments/asia-vet": "Asia Vet",
    "/helpdesk": "Help Desk",
    "/admin": "Dashboard",
    "/admin/ticket": "Tickets",
    "/admin/videos": "Videos",
    "/admin/documents": "Documents",
    "/admin/news": "News",
    "/admin/alert": "Alerts",
    "/admin/events": "Events",
    "/admin/gallery": "Gallery",
    "/admin/management": "Management",
    "/admin/users": "Users",
    "/admin/categories": "Categories",
    "/admin/auditLog": "Audit Logs",
};

const APP_NAME = "CIC Feeds Group";

export function usePageTitle() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Dynamic news detail route: /news/:id
        const isDynamic = pathname.startsWith("/news/");
        const label = isDynamic
            ? "News"
            : (ROUTE_TITLES[pathname] ?? "Not Found");

        document.title = `${label} | ${APP_NAME}`;
    }, [pathname]);
}