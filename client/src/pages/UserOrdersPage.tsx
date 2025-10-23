import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, MapPin, Clock, MessageCircle, Eye, Trash2, Pin } from 'lucide-react'
import { Order } from '../types'
import { orderService } from '../services/orderService'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'

const UserOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [swipedOrderId, setSwipedOrderId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { on } = useSocket()

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    // Socket events для real-time обновлений
    const unsubscribe = on('message', () => {
      loadOrders()
    })
    
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [on])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getOrders({})
      setOrders((response as any).orders || [])
    } catch (error) {
      console.error('Failed to load orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (orderId: string) => {
    if (!window.confirm('Удалить эту заявку?')) return
    
    try {
      await orderService.deleteOrder(orderId)
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (error) {
      console.error('Failed to delete order:', error)
    }
  }

  const handlePin = async (orderId: string) => {
    try {
      // await orderService.togglePin(orderId) // TODO: implement togglePin
      console.log('Pin order:', orderId)
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, isPinned: !(order as any).isPinned }
          : order
      ))
    } catch (error) {
      console.error('Failed to pin order:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white'
      case 'accepted': return 'bg-blue-500 text-white'
      case 'in_progress': return 'bg-purple-500 text-white'
      case 'completed': return 'bg-green-500 text-white'
      case 'cancelled': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Открытые'
      case 'accepted': return 'Ожидают'
      case 'in_progress': return 'В работе'
      case 'completed': return 'Завершено'
      case 'cancelled': return 'Отменено'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Мои заявки</h1>
          <button
            onClick={() => navigate('/orders/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Plus size={20} />
            <span className="font-medium">Создать заявку</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск заявок..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="all">Все статусы</option>
              <option value="pending">Открытые</option>
              <option value="accepted">Ожидают</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершено</option>
            </select>
          </div>
        </div>

        {/* Hint */}
        <div className="mt-3 text-sm text-gray-400 flex items-center space-x-2">
          <span>💡</span>
          <span>Свайпните справа налево для управления заявкой</span>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 py-6 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Нет заявок</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Попробуйте изменить фильтры поиска' 
                : 'Создайте свою первую заявку'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/orders/create')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <Plus size={20} className="inline mr-2" />
                Создать заявку
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              className="relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Swipe Actions Background */}
              <div className="absolute inset-0 flex items-center justify-end pr-4 bg-gradient-to-l from-red-500/20 to-transparent">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handlePin(order.id)}
                    className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <Pin size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Order Card */}
              <motion.div
                drag="x"
                dragConstraints={{ left: -120, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(e, info: PanInfo) => {
                  if (info.offset.x < -60) {
                    setSwipedOrderId(order.id)
                  } else {
                    setSwipedOrderId(null)
                  }
                }}
                className="relative bg-gray-900 border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-purple-500/50 transition-all"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{order.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{order.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                  <span className="px-3 py-1 bg-gray-800 rounded-full">{(order as any).category || 'Мебель'}</span>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {(order as any).responsesCount > 0 ? (
                      <span>{(order as any).responsesCount} откликов</span>
                    ) : (
                      <span>0 откликов</span>
                    )}
                  </div>
                  {(order as any).responsesCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/orders/${order.id}/responses`)
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <Eye size={16} />
                      <span>Просмотреть отклики</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default UserOrdersPage
