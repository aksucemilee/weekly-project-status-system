import { Navigate, Route, Routes } from "react-router";

import RequirePermission from "../auth/RequirePermission";
import { useAuth } from "../auth/authContext";
import MainLayout from "../layouts/MainLayout";
import AdminPage from "../pages/AdminPage";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import ProjectsPage from "../pages/ProjectsPage";
import ReportsPage from "../pages/ReportsPage";
import { getLandingPath } from "../types/auth";

/**
 * Giris yapmis kullaniciyi rolune uygun baslangic ekranina yonlendirir
 * (On Analiz 7.1 kabul kriteri). Dashboard artik yalnizca DASHBOARD_VIEW
 * yetkisi olan kullaniciya acik oldugu icin kosulsuz /dashboard
 * yonlendirmesi kaldirilmistir.
 */
function LandingRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getLandingPath(user)} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<MainLayout />}>
        <Route element={<RequirePermission permission="DASHBOARD_VIEW" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route element={<RequirePermission permission="PROJECT_VIEW" />}>
          <Route path="/projects" element={<ProjectsPage />} />
        </Route>

        <Route element={<RequirePermission permission="REPORT_VIEW" />}>
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        <Route element={<RequirePermission permission="USER_MANAGE" />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="/" element={<LandingRedirect />} />

      <Route path="*" element={<LandingRedirect />} />
    </Routes>
  );
}

export default AppRoutes;
