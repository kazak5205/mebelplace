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
    if (query.trim().length >= 2) {
      // Сразу переходим на страницу поиска, данные загрузятся там
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      handleSearch(searchQuery)
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-3 md:p-4 mx-2 md:mx-6 mt-2 md:mt-6 mb-0"
    >
      <div className="flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          <h1 className="text-lg md:text-2xl font-bold gradient-text whitespace-nowrap">
            MebelPlace
          </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4 flex-1 justify-end">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs md:max-w-md">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 pl-8 md:pl-10 bg-gray-900/90 border border-gray-700 rounded-xl text-sm md:text-base text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-md"
            />
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-white/70" />
          </form>

          <div className="flex items-center space-x-1.5 md:space-x-3 flex-shrink-0">
            {user ? (
              <>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">
                    {user.role === 'master' 
                      ? (user.companyName || user.username) 
                      : (user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Клиент')}
                  </p>
                  <p className="text-xs text-white/60">
                    {user.role === 'admin' ? 'Админ' : user.role === 'master' ? 'Мастер' : 'Клиент'}
                  </p>
                </div>
                
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="glass-button p-1.5 md:p-2 text-yellow-400 hover:text-yellow-300"
                      title="Админка"
                    >
                      <Settings className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.button>
                  </Link>
                )}
                
                <Link to="/profile">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-button p-1.5 md:p-2"
                  >
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="glass-button p-1.5 md:p-2 text-red-400 hover:text-red-300 hidden md:block"
                >
                  <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-button px-2 py-1 md:px-4 md:py-2 text-sm md:text-base"
                  >
                    Войти
                  </motion.button>
                </Link>
                <Link to="/register" className="hidden md:block">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-button px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  >
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
