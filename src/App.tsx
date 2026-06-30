import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./Pages/Home-page";
import HomePageFeeds from "./Pages/Our Segments/CIC Feeds/HomePageFeeds";
import HomePageAsiavet from "./Pages/Our Segments/Asia Vet/HomePageAsiavet";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminVideosPage from "./Pages/Admin/AdminVideo";
import AdminDocumentsPage from "./Pages/Admin/AdminDocumentsPage";
import NewsDetailPage from "./components/NewsDetailPage";
import AdminNewsPage from "./Pages/Admin/AdminNewsPage";
import AdminEventsPage from "./Pages/Admin/AdminEventsPage";
import AdminGalleryPage from "./Pages/Admin/AdminGalleryPage";
import AdminManagementPage from "./Pages/Admin/AdminManagementPage";
import AdminLogin from "./Pages/Admin/AdminLogin";
import ProtectedRoute from "@/ProtectedRoute";
import SuperAdminRoute from "@/SuperAdminRoute";
import AdminUsersPage from "./Pages/Admin/AdminUsersPage";
import AdminTicketsPage from "./Pages/Admin/AdminTicketsPage";
import HelpDeskPage from "./Pages/Our Segments/components/HelpDeskPage";
import EmployeeProtectedRoute from "./Pages/EmployeeProtectedRoute";
import NotFoundPage from "./components/shared/NotFoundPage";
import AdminCategoriesPage from "./Pages/Admin/AdminCategoriesPage";
import AdminAlertsPage from "./Pages/Admin/AdminAlertsPage";
import { usePageTitle } from "./hooks/usePageTitle";
import AdminAuditLogPage from "./Pages/Admin/AdminAuditLogPage";

function App() {
  usePageTitle();
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/our-segments/cic-feeds" element={<HomePageFeeds />} />
        <Route path="/our-segments/asia-vet" element={<HomePageAsiavet />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
      </Route>

      {/* ── Employee routes ── */}
      <Route element={<EmployeeProtectedRoute />}>
        <Route path="/helpdesk" element={<HelpDeskPage />} />
      </Route>

      {/* ── Admin login ── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ── Admin routes (SUPER_ADMIN + ADMIN) ── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          {/* Shared: ADMIN + SUPER_ADMIN */}
          <Route path="ticket" element={<AdminTicketsPage />} />

          {/* SUPER_ADMIN only */}
          <Route element={<SuperAdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="videos" element={<AdminVideosPage />} />
            <Route path="documents" element={<AdminDocumentsPage />} />
            <Route path="news" element={<AdminNewsPage />} />
            <Route path="alert" element={<AdminAlertsPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="management" element={<AdminManagementPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="auditLog" element={<AdminAuditLogPage />} />
          </Route>
        </Route>
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
