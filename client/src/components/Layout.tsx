import React from 'react'
import { motion } from 'framer-motion'
import Header from './Header'
import BottomNavigation from './BottomNavigation'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }


  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-1 pb-20 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-screen-xl mx-auto px-4">
            {children}
          </div>
        </motion.div>
      </main>
      <BottomNavigation />
    </div>
  )
}

export default Layout
