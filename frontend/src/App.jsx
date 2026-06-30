import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Services from './pages/Services'
import FarmMonitoring from './pages/FarmMonitoring'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ActivateAccount from './pages/ActivateAccount'

import DashboardLayout from './pages/dashboard/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import Farms from './pages/dashboard/Farms'
import FarmDetail from './pages/dashboard/FarmDetail'
import Tasks from './pages/dashboard/Tasks'
import Reports from './pages/dashboard/Reports'
import Users from './pages/dashboard/Users'
import Leads from './pages/dashboard/Leads'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Marketing site */}
          <Route path="/"                element={<Home />} />
          <Route path="/services"        element={<Services />} />
          <Route path="/farm-monitoring" element={<FarmMonitoring />} />
          <Route path="/about"           element={<About />} />
          <Route path="/gallery"         element={<Gallery />} />
          <Route path="/contact"         element={<Contact />} />

          {/* Auth */}
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/activate"        element={<ActivateAccount />} />

          {/* Dashboard (protected) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="farms" element={<Farms />} />
            <Route path="farms/:id" element={<FarmDetail />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="reports" element={<Reports />} />
            <Route
              path="leads"
              element={
                <ProtectedRoute roles={['admin', 'field_team']}>
                  <Leads />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
