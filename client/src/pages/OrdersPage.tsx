import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MapPin, Clock, Video, X, CheckCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { Order } from '../types'
import { orderService } from '../services/orderService'
import { videoService } from '../services/videoService'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { pluralizeResponses } from '../utils/pluralize'

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { on } = useSocket()

  useEffect(() => {
    loadOrders()
    checkMasterVideos()
  }, [regionFilter])

  useEffect(() => {
    orderService.getRegions()
      .then(setRegions)
      .catch(() => setRegions([]))
  }, [])

  const checkMasterVideos = async () => {
    // Проверяем только для мастеров
    if (user?.role !== 'master') return
    
    try {
      // Проверяем есть ли видео у мастера
      const response = await videoService.getVideos({ 
        author_id: user.id,
        limit: 1 
      })
      
      const videosExist = response.videos && response.videos.length > 0
      
      // Показываем welcome modal только если:
      // 1. Видео нет
      // 2. Пользователь ещё не закрывал это окно
      const hasSeenWelcome = localStorage.getItem('master_welcome_seen')
      if (!videosExist && !hasSeenWelcome) {
        setShowWelcomeModal(true)
      }
    } catch (error) {
      console.error('Failed to check master videos:', error)
    }
  }

  const handleCloseWelcome = () => {
    setShowWelcomeModal(false)
    localStorage.setItem('master_welcome_seen', 'true')
  }

  useEffect(() => {
    // Listen for new order responses
    on('new_order_response', (data) => {
      setOrders(prev => prev.map(order => 
        order.id === data.orderId 
          ? { ...order, responses: [...(order.responses || []), data.response] }
          : order
      ))
    })

    // Listen for order acceptance
    on('order_accepted', (data) => {
      setOrders(prev => prev.map(order => 
        order.id === data.orderId 
          ? { ...order, masterId: data.masterId, status: 'in_progress' as const }
          : order
      ))
    })
  }, [on])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getOrders({ region: regionFilter || undefined })
      setOrders(response.orders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Welcome Modal для новых мастеров */}
      <AnimatePresence>
        {showWelcomeModal && user?.role === 'master' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseWelcome}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 sm:p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={handleCloseWelcome}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 glass-button p-2 hover:bg-white/10"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="text-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Video className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                  Добро пожаловать на MebelPlace! 👋
                </h2>
                <p className="text-white/70 text-sm sm:text-lg">
                  Вы можете начать получать заказы прямо сейчас
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-1" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white mb-1">Отвечайте на заявки</h3>
                    <p className="text-white/70 text-xs sm:text-sm">
                      Вы можете отвечать на заявки клиентов и получать заказы уже сейчас!
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0 mt-0.5 sm:mt-1" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white mb-1">⚠️ Важно: Загрузите видеорекламу</h3>
                    <p className="text-white/70 text-xs sm:text-sm mb-2">
                      Пока вы не загрузите хотя бы одно видео с вашими работами, 
                      <strong className="text-yellow-300"> клиенты не смогут найти ваш профиль в поиске</strong>.
                    </p>
                    <p className="text-white/70 text-xs sm:text-sm">
                      Видео помогает клиентам увидеть качество вашей работы и принять решение о заказе.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleCloseWelcome()
                    navigate('/create-video-ad')
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-lg flex items-center justify-center space-x-2"
                >
                  <Video className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Создать видеорекламу</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseWelcome}
                  className="glass-button px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base"
                >
                  Позже
                </motion.button>
              </div>

              <p className="text-center text-white/50 text-xs sm:text-sm mt-3 sm:mt-4">
                Вы всегда можете создать видео через кнопку "Создать видеорекламу" в профиле
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-0 relative"
      >
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text text-center">Заявки</h1>
        {user?.role === 'user' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/orders/create')}
            className="glass-button flex items-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Создать заявку</span>
          </motion.button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-3 sm:p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
            <input
              type="text"
              placeholder="Поиск заявок..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10 sm:pl-12 text-sm sm:text-base"
            />
          </div>

          <div className="flex items-center space-x-2 sm:min-w-[200px]">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 flex-shrink-0" />
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="glass-input w-full text-sm sm:text-base"
            >
              <option value="">Все регионы</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h3 className="text-xl font-medium text-white/70 mb-2">
              {searchQuery ? 'Заявки не найдены' : 'Нет заявок'}
            </h3>
            <p className="text-white/50">
              {searchQuery
                ? 'Попробуйте изменить поисковый запрос'
                : user?.role === 'user' 
                  ? 'Создайте свою первую заявку'
                  : 'Пока нет доступных заявок'
              }
            </p>
          </motion.div>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard variant="hover" className="cursor-pointer">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                        {order.title}
                      </h3>
                      <p className="text-sm sm:text-base text-white/70 mb-3 sm:mb-4 line-clamp-2">
                        {order.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {order.region && (
                      <div className="flex items-center space-x-2 text-sm sm:text-base text-white/70">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="truncate">{order.region}</span>
                      </div>
                    )}
                    {order.location && (
                      <div className="flex items-center space-x-2 text-sm sm:text-base text-white/70">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="truncate">{typeof order.location === 'string' ? order.location : order.location.city || order.location.region}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm sm:text-base text-white/70">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex items-center space-x-3">
                      {order.master ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/master/${order.master!.id}`)
                          }}
                          className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold"
                          aria-label="Канал мастера"
                        >
                          {(order.master?.name || order.master?.username || 'M').charAt(0).toUpperCase()}
                        </button>
                      ) : order.client && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(order.client?.name || order.client?.username || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm text-white">
                          {order.master 
                            ? (order.master?.name || order.master?.username) 
                            : (order.client?.name || order.client?.username)}
                        </p>
                        <p className="text-xs text-white/60">{order.master ? 'Мастер' : 'Клиент'}</p>
                      </div>
                    </div>

                    {((order.responseCount && order.responseCount > 0) || (order as any).response_count > 0) && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {pluralizeResponses(order.responseCount || (order as any).response_count || 0)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
                    {((order.responseCount && order.responseCount > 0) || (order as any).response_count > 0) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/orders/${order.id}/responses`)}
                        className="glass-button px-3 sm:px-4 py-2 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <span className="whitespace-nowrap">Просмотреть отклики ({order.responseCount || (order as any).response_count})</span>
                      </motion.button>
                    )}
                    {user?.role === 'master' && order.status === 'pending' && !(order.hasMyResponse || (order as any).has_my_response) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/orders/${order.id}/respond`)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium w-full sm:w-auto"
                      >
                        Оставить отклик
                      </motion.button>
                    )}
                    {user?.role === 'master' && order.status === 'pending' && (order.hasMyResponse || (order as any).has_my_response) && (
                      <div className="px-3 sm:px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-xs sm:text-sm font-medium text-green-300 flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="whitespace-nowrap">Отклик отправлен</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default OrdersPage
