import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SocketProvider } from './contexts/SocketContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SmsVerificationPage from './pages/SmsVerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import HomePage from './pages/HomePage'
import ChatListPage from './pages/ChatListPage'
import ChatPage from './pages/ChatPage'
import SupportPage from './pages/SupportPage'
import OrdersPage from './pages/OrdersPage'
import UserOrdersPage from './pages/UserOrdersPage'
import CreateOrderPage from './pages/CreateOrderPage'
import OrderResponsesPage from './pages/OrderResponsesPage'
import OrderRespondPage from './pages/OrderRespondPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ProfilePage from './pages/ProfilePage'
import MasterChannelPage from './pages/MasterChannelPage'
import AdminPage from './pages/AdminPage'
import SearchResultsPage from './pages/SearchResultsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import CreateVideoPage from './pages/CreateVideoPage'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-black"
        >
          <Routes>
            {/* Auth Pages - NO Layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/sms-verification" element={<SmsVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* HomePage - NO Layout (Full Screen TikTok Style) */}
            <Route path="/" element={<HomePage />} />
            
            {/* All other pages - WITH Layout */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  
                  {/* Messenger */}
                  <Route path="/user/messenger" element={<ChatListPage />} />
                  <Route path="/user/messenger/:id" element={<ChatPage />} />
                  <Route path="/user/support" element={<SupportPage />} />
                  {/* Legacy routes - redirect */}
                  <Route path="/chat" element={<ChatListPage />} />
                  <Route path="/chat/:id" element={<ChatPage />} />
              
              {/* Orders - Master */}
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/master/orders" element={<OrdersPage />} />
              
              {/* Orders - Client */}
              <Route path="/user/orders" element={<UserOrdersPage />} />
              
              {/* Orders - Common */}
              <Route path="/orders/create" element={<CreateOrderPage />} />
              <Route path="/orders/:id/responses" element={<OrderResponsesPage />} />
              <Route path="/orders/:id/respond" element={<OrderRespondPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              
              {/* Profile */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:id" element={<MasterChannelPage />} />
              <Route path="/master/:id" element={<MasterChannelPage />} />
              <Route path="/master/profile" element={<ProfilePage />} />
              
              {/* Video */}
              <Route path="/create-video-ad" element={<CreateVideoPage />} />
              
              {/* Admin */}
              <Route path="/admin" element={<AdminPage />} />
              
              {/* Search */}
              <Route path="/search" element={<SearchResultsPage />} />
              
                  {/* Legal */}
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </motion.div>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
