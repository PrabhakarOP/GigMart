import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Layout from './components/layout/Layout';

// Auth Guards
import {
  GuestRoute,
  ProtectedRoute,
  ProviderRoute,
  WorkerRoute,
  AdminRoute,
} from './components/auth/Guards';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import GigListPage from './pages/gigs/GigListPage';
import CreateGigPage from './pages/gigs/CreateGigPage';
import GigDetailPage from './pages/gigs/GigDetailPage';
import BookingDetailPage from './pages/bookings/BookingDetailPage';
import MessagesPage from './pages/messages/MessagesPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProviderDashboard from './pages/dashboard/ProviderDashboard';
import WorkerDashboard from './pages/dashboard/WorkerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              <Route element={<Layout />}>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/gigs" element={<GigListPage />} />
                <Route path="/gigs/:id" element={<GigDetailPage />} />

                {/* Guest Only Routes */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />

                {/* Provider Protected Routes */}
                <Route
                  path="/gigs/create"
                  element={
                    <ProviderRoute>
                      <CreateGigPage />
                    </ProviderRoute>
                  }
                />
                <Route
                  path="/dashboard/provider"
                  element={
                    <ProviderRoute>
                      <ProviderDashboard />
                    </ProviderRoute>
                  }
                />

                {/* Worker Protected Routes */}
                <Route
                  path="/dashboard/worker"
                  element={
                    <WorkerRoute>
                      <WorkerDashboard />
                    </WorkerRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/dashboard/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* General Protected Routes */}
                <Route
                  path="/bookings/:id"
                  element={
                    <ProtectedRoute>
                      <BookingDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all Wildcard Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
