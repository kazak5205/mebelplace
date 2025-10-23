import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, MapPin, Clock } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { Order } from '../types'
import { orderService } from '../services/orderService'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { on } = useSocket()

  useEffect(() => {
    loadOrders()
  }, [regionFilter])

  useEffect(() => {
    orderService.getRegions()
      .then(setRegions)
      .catch(() => setRegions([]))
  }, [])

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
                    {order.location?.region && (
                      <div className="flex items-center space-x-2 text-white/70">
                        <MapPin className="w-5 h-5" />
                        <span>{order.location.region}</span>
                      </div>
                    )}
                    {order.location?.city && (
                      <div className="flex items-center space-x-2 text-white/70">
                        <MapPin className="w-5 h-5" />
                        <span>{order.location.city}</span>
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

                    {order.responses && order.responses.length > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {order.responses.length} откликов
                        </p>
                        <p className="text-xs text-white/60">
                          {order.responses.filter((r: any) => r.status === 'accepted').length} принято
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-4">
                    {order.responses && order.responses.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/orders/${order.id}/responses`)}
                        className="glass-button px-4 py-2 text-sm"
                      >
                        Просмотреть отклики
                      </motion.button>
                    )}
                    {user?.role === 'master' && order.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/orders/${order.id}/respond`)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Оставить отклик
                      </motion.button>
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
