import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SocketProvider } from './contexts/SocketContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ChatListPage from './pages/ChatListPage'
import ChatPage from './pages/ChatPage'
import OrdersPage from './pages/OrdersPage'
import CreateOrderPage from './pages/CreateOrderPage'
import OrderResponsesPage from './pages/OrderResponsesPage'
import OrderRespondPage from './pages/OrderRespondPage'
import ProfilePage from './pages/ProfilePage'
import MasterChannelPage from './pages/MasterChannelPage'
import AdminPage from './pages/AdminPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<ChatListPage />} />
              <Route path="/chat/:id" element={<ChatPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/create" element={<CreateOrderPage />} />
              <Route path="/orders/:id/responses" element={<OrderResponsesPage />} />
              <Route path="/orders/:id/respond" element={<OrderRespondPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/master/:id" element={<MasterChannelPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
            </Routes>
          </Layout>
        </motion.div>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
