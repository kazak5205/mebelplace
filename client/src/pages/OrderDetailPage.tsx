import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, DollarSign, User as UserIcon, MessageCircle, Eye } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { orderService } from '../services/orderService'
import { useAuth } from '../contexts/AuthContext'

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const response = await orderService.getOrder(id!)
      setOrder(response)
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white'
      case 'accepted': return 'bg-blue-500 text-white'
      case 'in_progress': return 'bg-orange-500 text-white'
      case 'completed': return 'bg-green-500 text-white'
      case 'cancelled': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Открытая'
      case 'accepted': return 'Принята'
      case 'in_progress': return 'В работе'
      case 'completed': return 'Завершена'
      case 'cancelled': return 'Отменена'
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-white/70 mb-2">Заявка не найдена</h3>
        <button
          onClick={() => navigate('/orders')}
          className="glass-button px-4 py-2"
        >
          Вернуться к заявкам
        </button>
      </div>
    )
  }

  const isOwner = user?.id === order.clientId
  const isMaster = user?.role === 'master'
  const canRespond = isMaster && order.status === 'pending' && !order.hasMyResponse

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="glass-button p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Детали заявки</h1>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">{order.title}</h2>
            <p className="text-white/70 mb-6 whitespace-pre-wrap">{order.description}</p>

            {/* Images Gallery */}
            {order.images && order.images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white/80 mb-3">
                  Фотографии ({order.images.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {order.images.map((image: string, index: number) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="aspect-square rounded-lg overflow-hidden bg-white/5 cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={`https://mebelplace.com.kz${image}`}
                        alt={`Фото ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {order.price && (
                <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-white/60">Бюджет</p>
                    <p className="text-lg font-semibold text-white">{order.price.toLocaleString()} ₸</p>
                  </div>
                </div>
              )}
              
              {order.deadline && (
                <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-white/60">Срок</p>
                    <p className="text-lg font-semibold text-white">
                      {new Date(order.deadline).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}

              {order.region && (
                <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-sm text-white/60">Регион</p>
                    <p className="text-lg font-semibold text-white">{order.region}</p>
                  </div>
                </div>
              )}

              {order.location && (
                <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-white/60">Город</p>
                    <p className="text-lg font-semibold text-white">{order.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-white/60">Создана</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>

              {order.category && (
                <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                  <div className="w-5 h-5 text-yellow-400">📦</div>
                  <div>
                    <p className="text-sm text-white/60">Категория</p>
                    <p className="text-lg font-semibold text-white">{order.category}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Client Info */}
            {(order.clientUsername || order.clientFirstName) && (
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Клиент</p>
                    <p className="text-lg font-semibold text-white">
                      {order.clientFirstName && order.clientLastName
                        ? `${order.clientFirstName} ${order.clientLastName}`
                        : order.clientUsername || 'Клиент'}
                    </p>
                    {order.clientPhone && <p className="text-sm text-white/50">{order.clientPhone}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3"
      >
        {isOwner && order.responses && order.responses.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/orders/${id}/responses`)}
            className="glass-button bg-gradient-to-r from-blue-500 to-purple-500 flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Просмотреть отклики ({order.responses.length})</span>
          </motion.button>
        )}

        {canRespond && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/orders/${id}/respond`)}
            className="glass-button bg-gradient-to-r from-green-500 to-emerald-500 flex items-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Оставить отклик</span>
          </motion.button>
        )}

        {isMaster && order.hasMyResponse && (
          <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-sm font-medium text-green-300 flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Вы уже откликнулись</span>
          </div>
        )}
      </motion.div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-4xl max-h-[90vh]"
          >
            <img
              src={`https://mebelplace.com.kz${selectedImage}`}
              alt="Увеличенное фото"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 glass-button p-2"
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default OrderDetailPage

