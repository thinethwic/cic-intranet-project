import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { usePageTitle } from "./hooks/usePageTitle";

// Eagerly loaded — always needed
import Layout from "./components/Layout";
import ProtectedRoute from "@/ProtectedRoute";
import SuperAdminRoute from "@/SuperAdminRoute";
import EmployeeProtectedRoute from "./Pages/EmployeeProtectedRoute";
import NotFoundPage from "./components/shared/NotFoundPage";

// Lazy-loaded pages — deferred until first navigation
const HomePage = lazy(() => import("./Pages/Home-page"));
const HomePageFeeds = lazy(() => import("./Pages/Our Segments/CIC Feeds/HomePageFeeds"));
const HomePageAsiavet = lazy(() => import("./Pages/Our Segments/Asia Vet/HomePageAsiavet"));
const NewsDetailPage = lazy(() => import("./components/NewsDetailPage"));
const HelpDeskPage = lazy(() => import("./Pages/Our Segments/components/HelpDeskPage"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboard = lazy(() => import("./Pages/Admin/AdminDashboard"));
const AdminVideosPage = lazy(() => import("./Pages/Admin/AdminVideo"));
const AdminDocumentsPage = lazy(() => import("./Pages/Admin/AdminDocumentsPage"));
const AdminNewsPage = lazy(() => import("./Pages/Admin/AdminNewsPage"));
const AdminAlertsPage = lazy(() => import("./Pages/Admin/AdminAlertsPage"));
const AdminEventsPage = lazy(() => import("./Pages/Admin/AdminEventsPage"));
const AdminGalleryPage = lazy(() => import("./Pages/Admin/AdminGalleryPage"));
const AdminManagementPage = lazy(() => import("./Pages/Admin/AdminManagementPage"));
const AdminUsersPage = lazy(() => import("./Pages/Admin/AdminUsersPage"));
const AdminTicketsPage = lazy(() => import("./Pages/Admin/AdminTicketsPage"));
const AdminCategoriesPage = lazy(() => import("./Pages/Admin/AdminCategoriesPage"));
const AdminAuditLogPage = lazy(() => import("./Pages/Admin/AdminAuditLogPage"));

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cic-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  usePageTitle();
  return (
    <Suspense fallback={<PageSpinner />}>
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
    </Suspense>
  );
}

export default App;
