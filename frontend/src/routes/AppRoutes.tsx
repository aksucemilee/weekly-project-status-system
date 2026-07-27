import { Navigate, Route, Routes } from 'react-router'

import MainLayout from '../layouts/MainLayout'
import LoginPage from '../pages/LoginPage'
import ProjectsPage from '../pages/ProjectsPage'
import ReportsPage from '../pages/ReportsPage'
import DashboardPage from '../pages/DashboardPage'
import AdminPage from '../pages/AdminPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route element={<MainLayout />}>
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes