import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from '../LandingPage/LandingPage'
import Layout from '../Layout/Layout'
import LoginPage from '../LoginPage/LoginPage'
import NotFoundPage from '../NotFoundPage/NotFoundPage'
import ProfilePage from '../ProfilePage/ProfilePage'
import AdminPage from '../AdminPage/AdminPage'
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute'
import RegistrationPage from '../RegistrationPage/RegistrationPage'
import React from 'react'
import 'src/assets/css/fonts.css'
import 'src/assets/css/overrides.css'
import ForgotPasswordPage from '../ForgotPasswordPage/ForgotPasswordPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProtectedRoute component={ProfilePage} verifiedUserRoute={true} />} />
          <Route path="/admin" element={<ProtectedRoute component={AdminPage} adminRoute={true} />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
