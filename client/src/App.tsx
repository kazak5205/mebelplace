import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, createLocalStorageAdapter } from '@shared/contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import { ProtectedRoute } from '@shared/routing/ProtectedRoute'
import { authService } from './services/authService'
import OnboardingModal from './components/OnboardingModal'

// Pages
import HomePage from './pages/HomePage'
import MasterChannelPage from './pages/MasterChannelPage'
import OrdersPage from './pages/OrdersPage'
import CreateOrderPage from './pages/CreateOrderPage'
import OrderResponsesPage from './pages/OrderResponsesPage'
import OrderRespondPage from './pages/OrderRespondPage'
import ChatListPage from './pages/ChatListPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'

// Auth components
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import SmsVerification from './components/auth/SmsVerification'

// Admin components для отдельных роутов
import AdminDashboard from './components/admin/AdminDashboard'
import VideoManagement from './components/admin/VideoManagement'
import UserManagement from './components/admin/UserManagement'
import AnalyticsDashboard from './components/admin/AnalyticsDashboard'
import CategoryManagement from './components/admin/CategoryManagement'
import AuditLog from './components/admin/AuditLog'

const storageAdapter = createLocalStorageAdapter();

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider storage={storageAdapter} authService={authService}>
        <SocketProvider>
          <OnboardingModal />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/verify-sms" element={<SmsVerification />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />

            {/* Main app routes with Layout */}
            <Route element={<Layout />}>
              {/* Home - can be viewed without auth */}
              <Route path="/" element={<HomePage />} />
              
              {/* Master channel - public */}
              <Route path="/master/:id" element={<MasterChannelPage />} />

              {/* Protected routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              {/* Orders */}
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/orders/create" element={
                <ProtectedRoute allowedRoles={['client', 'user', 'admin']}>
                  <CreateOrderPage />
                </ProtectedRoute>
              } />
              <Route path="/orders/:id/responses" element={
                <ProtectedRoute>
                  <OrderResponsesPage />
                </ProtectedRoute>
              } />
              <Route path="/orders/:id/respond" element={
                <ProtectedRoute allowedRoles={['master', 'admin']}>
                  <OrderRespondPage />
                </ProtectedRoute>
              } />

              {/* Chat */}
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatListPage />
                </ProtectedRoute>
              } />
              <Route path="/chat/:id" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />

              {/* Admin routes - старый формат (табы через state) */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } />

              {/* Admin routes - новые подстраницы */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/videos" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/audit" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

