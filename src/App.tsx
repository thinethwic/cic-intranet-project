import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./Pages/Home-page";
import HomePageFeeds from "./Pages/Our Segments/CIC Feeds/HomePageFeeds";
import HomePageVetcare from "./Pages/Our Segments/CIC Vetcare/HomePageVetcare";
import HomePagePoulry from "./Pages/Our Segments/CIC Poulry/HomePagePoulry";
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
import ProtectedRoute from "@/ProtectedRoute"; // ✅

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/our-segments/cic-feeds" element={<HomePageFeeds />} />
        <Route path="/our-segments/cic-vetcare" element={<HomePageVetcare />} />
        <Route path="/our-segments/cic-poulry" element={<HomePagePoulry />} />
        <Route path="/our-segments/asia-vet" element={<HomePageAsiavet />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
      </Route>

      {/* ✅ Redirect to /admin if already logged in */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ✅ All admin routes protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="/admin/videos" element={<AdminVideosPage />} />
          <Route path="/admin/documents" element={<AdminDocumentsPage />} />
          <Route path="/admin/news" element={<AdminNewsPage />} />
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/gallery" element={<AdminGalleryPage />} />
          <Route path="/admin/management" element={<AdminManagementPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
