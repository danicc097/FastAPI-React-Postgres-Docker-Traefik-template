import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from 'src/components/Layout/Layout'
import LoginPage from 'src/views/Login/LoginPage/LoginPage'
import NotFoundPage from 'src/components/NotFoundPage/NotFoundPage'
import ProfilePage from 'src/views/Profile/ProfilePage/ProfilePage'
import ProtectedRoute from 'src/components/ProtectedRoute/ProtectedRoute'
import RegistrationPage from 'src/views/Registration/RegistrationPage/RegistrationPage'
import React from 'react'
import 'src/assets/css/fonts.css'
import 'src/assets/css/overrides.css'
import ForgotPasswordPage from 'src/views/ForgotPassword/ForgotPasswordPage/ForgotPasswordPage'
import LandingPage from './views/Home/LandingPage/LandingPage'
import UnverifiedUsersPage from './views/Admin/UnverifiedUsersPage/UnverifiedUsersPage'
import PasswordResetPage from './views/Admin/PasswordResetPage/PasswordResetPage'
import PasswordResetRequestsPage from './views/Admin/PasswordResetRequestsPage/PasswordResetRequestsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProtectedRoute component={ProfilePage} verifiedUserRoute={true} />} />
          <Route
            path="/admin/unverified-users"
            element={<ProtectedRoute component={UnverifiedUsersPage} adminRoute={true} />}
          />
          <Route
            path="/admin/password-reset"
            element={<ProtectedRoute component={PasswordResetPage} adminRoute={true} />}
          />
          <Route
            path="/admin/password-reset-requests"
            element={<ProtectedRoute component={PasswordResetRequestsPage} adminRoute={true} />}
          />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
