import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    console.log('🔍 handleSearch called with:', query)
    if (query.trim().length >= 2) {
      console.log('🔍 Navigating to search page with query:', query)
      // Сразу переходим на страницу поиска, данные загрузятся там
      navigate(`/search?q=${encodeURIComponent(query)}`)
    } else {
      console.log('⚠️ Query too short:', query.length)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    console.log('🔍 handleSearchSubmit called')
    e.preventDefault()
    console.log('🔍 searchQuery:', searchQuery)
    if (searchQuery.trim()) {
      handleSearch(searchQuery)
    } else {
      console.log('⚠️ Search query is empty')
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-3 md:p-4 mx-4 md:mx-6 mt-4 md:mt-6 mb-0"
    >
      <div className="max-w-screen-xl mx-auto px-2 md:px-4">
        <div className="grid items-center gap-3 md:gap-4 [grid-template-columns:auto_1fr_auto]">
        {/* Logo (left) */}
        <div className="flex items-center">
          <h1 className="text-lg md:text-2xl font-bold gradient-text whitespace-nowrap">
            MebelPlace
          </h1>
        </div>

        {/* Search (center) */}
        <div className="flex items-center justify-center justify-self-center w-full">
          <form onSubmit={handleSearchSubmit} role="search" aria-label="Поиск по видео" className="relative w-full max-w-md">
            <input
              type="text"
              inputMode="search"
              aria-label="Поле поиска"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 pl-9 md:pl-10 pr-9 md:pr-10 bg-gray-900/90 border border-gray-700 rounded-xl text-sm md:text-base text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-md"
            />
            <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
            <button
              type="submit"
              aria-label="Искать"
              className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 md:w-7 md:h-7 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg flex items-center justify-center transition-colors"
              title="Искать"
            >
              <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-400" />
            </button>
          </form>
        </div>

        {/* Actions (right) */}
        <div className="flex items-center justify-end space-x-2 md:space-x-3">
          {user ? (
            <>
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium">
                  {user.role === 'master' 
                    ? (user.companyName || user.username) 
                    : (user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Клиент')}
                </p>
                <p className="text-sm text-white/60">
                  {user.role === 'admin' ? 'Админ' : user.role === 'master' ? 'Мастер' : 'Клиент'}
                </p>
              </div>
              {user.role === 'admin' && (
                <Link to="/admin">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="glass-button p-2 text-yellow-400 hover:text-yellow-300" title="Админка">
                    <Settings className="w-5 h-5" />
                  </motion.button>
                </Link>
              )}
              <Link to="/profile">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="glass-button p-2">
                  <User className="w-5 h-5" />
                </motion.button>
              </Link>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={logout} className="glass-button p-2 text-red-400 hover:text-red-300 hidden md:block">
                <LogOut className="w-5 h-5" />
              </motion.button>
            </>
          ) : (
            <>
              <Link to="/login">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="glass-button px-3 py-2 md:px-4 md:py-2 text-sm md:text-base whitespace-nowrap">
                  Войти
                </motion.button>
              </Link>
              <Link to="/register" className="hidden md:block">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="glass-button px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-sm md:text-base whitespace-nowrap">
                  Регистрация
                </motion.button>
              </Link>
            </>
          )}
        </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
