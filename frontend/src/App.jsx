import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Theme & Layout
import { useThemeStore } from './hooks/useThemeStore';
import { useAuthStore } from './store/authStore';

import { DashboardLayout } from './components/shared/DashboardLayout';
import { ProtectedRoute, getDashboardPath } from './components/shared/ProtectedRoute';

// Public pages
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import LandingPage from './pages/landing/LandingPage';
import AdminApprovalPage from './pages/AdminApprovalPage';

// Role dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalyticsPage from './pages/admin/AnalyticsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import StudentDashboard from './pages/student/StudentDashboard';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';

// Shared feature pages (stubs or existing)
import TicketListPage from './features/ticket/pages/TicketListPage';
import TicketDetailPage from './features/ticket/pages/TicketDetailPage';
import CreateTicketPage from './features/ticket/pages/CreateTicketPage';
 
import EditTicketPage from './features/ticket/pages/EditTicketPage';

import ResourceListPage from './features/resources/pages/ResourceListPage';
import ResourceDetailPage from './features/resources/pages/ResourceDetailPage';
import AdminResourceManagePage from './features/resources/pages/AdminResourceManagePage';
import AdminResourceFormPage from './features/resources/pages/AdminResourceFormPage';
import { BookingListPage } from './features/booking/pages/BookingListPage';
import { AdminBookingsPage } from './features/booking/pages/AdminBookingsPage';
import { CreateBookingPage } from './features/booking/pages/CreateBookingPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

const queryClient = new QueryClient();

/**
 * Redirects users from the legacy /dashboard path to their 
 * specific role-based dashboard.
 */
function DashboardRedirect() {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme) {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin/login" element={<AuthPage isAdmin={true} />} />
          <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

          {/* Legacy Redirect */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />

          {/* Role-Based Dashboard Trees */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            {/* Future Admin Pages */}
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="resources" element={<AdminResourceManagePage />} />
            <Route path="resources/create" element={<AdminResourceFormPage />} />
            <Route path="resources/:id/edit" element={<AdminResourceFormPage />} />
            <Route path="resources/:id" element={<ResourceDetailPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="tickets" element={<TicketListPage isAdmin={true} />} />
            <Route path="registrations" element={<AdminApprovalPage />} />
            <Route path="notifications" element={<NotificationsPage adminMode={true} />} />
          </Route>

          <Route path="/student" element={
            <ProtectedRoute requiredRole="STUDENT">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="resources" element={<ResourceListPage />} />
            <Route path="resources/:id" element={<ResourceDetailPage />} />
          </Route>

          <Route path="/lecturer" element={
            <ProtectedRoute requiredRole="LECTURER">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LecturerDashboard />} />
            <Route path="resources" element={<ResourceListPage />} />
            <Route path="resources/:id" element={<ResourceDetailPage />} />
          </Route>

          <Route path="/technician" element={
            <ProtectedRoute requiredRole="TECHNICIAN">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TechnicianDashboard />} />
            <Route path="resources" element={<ResourceListPage />} />
            <Route path="resources/:id" element={<ResourceDetailPage />} />
          </Route>

          {/* Shared Feature Routes */}
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tickets/my" element={<TicketListPage />} />
            <Route path="/tickets/assigned" element={<TicketListPage isAssigned={true} />} />
            <Route path="/tickets/new" element={<CreateTicketPage />} />
            <Route path="/tickets/:id/edit" element={<EditTicketPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/bookings/my" element={<BookingListPage />} />
            <Route path="/bookings/new" element={<CreateBookingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Default — redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

export default App;