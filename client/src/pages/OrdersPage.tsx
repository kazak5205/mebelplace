import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, MapPin, Clock, Video, X, CheckCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { Order } from '../types'
import { orderService } from '../services/orderService'
import { videoService } from '../services/videoService'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400'
      case 'in_progress': return 'text-blue-400'
      case 'completed': return 'text-green-400'
      case 'cancelled': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает'
      case 'in_progress': return 'В работе'
      case 'completed': return 'Завершено'
      case 'cancelled': return 'Отменено'
      default: return status
    }
  }

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
    <div className="space-y-6">
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
              className="glass-card p-8 max-w-2xl w-full relative"
            >
              <button
                onClick={handleCloseWelcome}
                className="absolute top-4 right-4 glass-button p-2 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold gradient-text mb-2">
                  Добро пожаловать на MebelPlace! 👋
                </h2>
                <p className="text-white/70 text-lg">
                  Вы можете начать получать заказы прямо сейчас
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-1">Отвечайте на заявки</h3>
                    <p className="text-white/70 text-sm">
                      Вы можете отвечать на заявки клиентов и получать заказы уже сейчас!
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <Video className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-1">⚠️ Важно: Загрузите видеорекламу</h3>
                    <p className="text-white/70 text-sm mb-2">
                      Пока вы не загрузите хотя бы одно видео с вашими работами, 
                      <strong className="text-yellow-300"> клиенты не смогут найти ваш профиль в поиске</strong>.
                    </p>
                    <p className="text-white/70 text-sm">
                      Видео помогает клиентам увидеть качество вашей работы и принять решение о заказе.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleCloseWelcome()
                    navigate('/create-video-ad')
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2"
                >
                  <Video className="w-6 h-6" />
                  <span>Создать видеорекламу</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseWelcome}
                  className="glass-button px-6 py-4 font-medium"
                >
                  Позже
                </motion.button>
              </div>

              <p className="text-center text-white/50 text-sm mt-4">
                Вы всегда можете создать видео через кнопку "Создать видеорекламу" в профиле
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold gradient-text">Заявки</h1>
        {user?.role === 'user' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/orders/create')}
            className="glass-button flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Создать заявку</span>
          </motion.button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="Поиск заявок..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-12"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input"
            >
              <option value="all">Все статусы</option>
              <option value="pending">Ожидает</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Отменено</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-white/60" />
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="glass-input"
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
              {searchQuery || statusFilter !== 'all' ? 'Заявки не найдены' : 'Нет заявок'}
            </h3>
            <p className="text-white/50">
              {searchQuery || statusFilter !== 'all'
                ? 'Попробуйте изменить фильтры'
                : user?.role === 'user' 
                  ? 'Создайте свою первую заявку'
                  : 'Пока нет доступных заявок'
              }
            </p>
          </motion.div>
        ) : (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard variant="hover" className="cursor-pointer">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {order.title}
                      </h3>
                      <p className="text-white/70 mb-4 line-clamp-2">
                        {order.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {order.region && (
                      <div className="flex items-center space-x-2 text-white/70">
                        <MapPin className="w-5 h-5" />
                        <span>{order.region}</span>
                      </div>
                    )}
                    {order.location && (
                      <div className="flex items-center space-x-2 text-white/70">
                        <MapPin className="w-5 h-5" />
                        <span>{typeof order.location === 'string' ? order.location : order.location.city || order.location.region}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-white/70">
                      <Clock className="w-5 h-5" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
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
                          {order.responseCount || (order as any).response_count} откликов
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-4">
                    {((order.responseCount && order.responseCount > 0) || (order as any).response_count > 0) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/orders/${order.id}/responses`)}
                        className="glass-button px-4 py-2 text-sm"
                      >
                        Просмотреть отклики ({order.responseCount || (order as any).response_count})
                      </motion.button>
                    )}
                    {user?.role === 'master' && order.status === 'pending' && !(order.hasMyResponse || (order as any).has_my_response) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/orders/${order.id}/respond`)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Оставить отклик
                      </motion.button>
                    )}
                    {user?.role === 'master' && order.status === 'pending' && (order.hasMyResponse || (order as any).has_my_response) && (
                      <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-sm font-medium text-green-300 flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Отклик отправлен</span>
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
