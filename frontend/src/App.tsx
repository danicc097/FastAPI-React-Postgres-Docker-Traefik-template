import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React from 'react'
import 'src/assets/css/fonts.css'
import 'src/assets/css/overrides.css'
import FallbackLoading from 'src/components/Loading/FallbackLoading'
import { useSSE } from 'src/hooks/feed/useSSE'
import { useStream } from 'src/hooks/feed/useStream'
import 'regenerator-runtime/runtime'
const Layout = React.lazy(() => import('src/components/Layout/Layout'))
const LoginPage = React.lazy(() => import('src/views/Login/LoginPage/LoginPage'))
const HelpPage = React.lazy(() => import('src/views/Help/HelpPage/HelpPage'))
const LandingPage = React.lazy(() => import('src/views/Home/LandingPage/LandingPage'))
const NotFoundPage = React.lazy(() => import('src/components/NotFoundPage/NotFoundPage'))
const ProfilePage = React.lazy(() => import('src/views/Profile/ProfilePage/ProfilePage'))
const ProtectedRoute = React.lazy(() => import('src/components/ProtectedRoute/ProtectedRoute'))
const RegistrationPage = React.lazy(() => import('src/views/Registration/RegistrationPage/RegistrationPage'))
const ForgotPasswordPage = React.lazy(() => import('src/views/ForgotPassword/ForgotPasswordPage/ForgotPasswordPage'))
const UnverifiedUsersPage = React.lazy(() => import('./views/Admin/UnverifiedUsersPage/UnverifiedUsersPage'))
const PasswordResetPage = React.lazy(() => import('./views/Admin/PasswordResetPage/PasswordResetPage'))
const PasswordResetRequestsPage = React.lazy(
  () => import('./views/Admin/PasswordResetRequestsPage/PasswordResetRequestsPage'),
)
const UserPermissionsPage = React.lazy(() => import('src/views/Admin/UserPermissionsPage/UserPermissionsPage'))

export default function App() {
  // useSSE()
  useStream()

  return (
    <BrowserRouter>
      <React.Suspense fallback={<div style={{ backgroundColor: 'azure', height: '100vh', width: '100vw' }} />}>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <React.Suspense fallback={<FallbackLoading />}>
                  <LandingPage />
                </React.Suspense>
              }
            />
            <Route path="/test-load" element={<FallbackLoading />} />
            <Route
              path="/login"
              element={
                <React.Suspense fallback={<FallbackLoading />}>
                  <LoginPage />
                </React.Suspense>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <React.Suspense fallback={<FallbackLoading />}>
                  <ForgotPasswordPage />
                </React.Suspense>
              }
            />
            <Route
              path="/profile"
              element={
                <React.Suspense fallback={<FallbackLoading />}>
                  <ProtectedRoute component={ProfilePage} verifiedUserRoute />
                </React.Suspense>
              }
            />
            <Route
              path="/admin/unverified-users"
              element={
                <React.Suspense fallback={<FallbackLoading />}>
                  <ProtectedRoute component={UnverifiedUsersPage} adminRoute />
                </React.Suspense>
              }
            />
            <Route
              path="/admin/password-reset"
              element={
                <React.Suspense fallback={<FallbackLoading />}>
                  <ProtectedRoute component={PasswordResetPage} adminRoute />
                </React.Suspense>
              }
            />
            <Route
              path="/admin/user-permissions-management"
              element={
                <React.Suspense fallback={<FallbackLoading />}>
                  <ProtectedRoute component={UserPermissionsPage} adminRoute />
                </React.Suspense>
              }
            />
            <Route
              path="/admin/password-reset-requests"
              element={
                <React.Suspense fallback={<FallbackLoading />}>
                  <ProtectedRoute component={PasswordResetRequestsPage} adminRoute />
                </React.Suspense>
              }
            />
            <Route
              path="/registration"
              element={
                <React.Suspense fallback={<FallbackLoading />}>
                  <RegistrationPage />
                </React.Suspense>
              }
            />
            <Route
              path="/help"
              element={
                <React.Suspense fallback={<FallbackLoading />}>
                  <ProtectedRoute component={HelpPage} verifiedUserRoute />
                </React.Suspense>
              }
            />
            <Route
              path="*"
              element={
                <React.Suspense fallback={<FallbackLoading />}>
                  <NotFoundPage />
                </React.Suspense>
              }
            />
          </Routes>
        </Layout>
      </React.Suspense>
    </BrowserRouter>
  )
}
