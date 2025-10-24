import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Star, Clock, MessageCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { orderService } from '../services/orderService'
import { chatService } from '../services/chatService'

const OrderResponsesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingResponse, setAcceptingResponse] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadOrderAndResponses()
    }
  }, [id])

  const loadOrderAndResponses = async () => {
    try {
      setLoading(true)
      const [orderResponse, responsesResponse] = await Promise.all([
        orderService.getOrder(id!),
        orderService.getOrderResponses(id!)
      ])
      
      setOrder(orderResponse)
      // responsesResponse уже является массивом согласно orderService
      setResponses(Array.isArray(responsesResponse) ? responsesResponse : [])
    } catch (error) {
      console.error('Failed to load order and responses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptResponse = async (responseId: string) => {
    try {
      setAcceptingResponse(responseId)
      console.log('🔍 Accepting response:', responseId)
      const result = await orderService.acceptResponse(id!, responseId)
      console.log('🔍 Accept response result:', result)
      console.log('🔍 Chat ID:', result?.chat?.id)
      
      // Обновляем статус заказа
      setOrder((prev: any) => ({ ...prev, status: 'accepted' }))
      
      // Удаляем принятый отклик из списка
      setResponses(prev => prev.filter(r => r.id !== responseId))
      
      // Переходим в созданный чат
      if (result?.chat?.id) {
        console.log('🔍 Navigating to chat:', result.chat.id)
        navigate(`/chat/${result.chat.id}`)
      } else {
        console.error('❌ No chat ID returned!', result)
        alert('Чат создан, но не удалось перейти. Проверьте мессенджер.')
      }
    } catch (error) {
      console.error('Failed to accept response:', error)
      alert('Ошибка при принятии отклика')
    } finally {
      setAcceptingResponse(null)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'только что'
    if (diffInHours < 24) return `${diffInHours}ч назад`
    return date.toLocaleDateString('ru-RU')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/orders')}
          className="glass-button p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Отклики на заявку</h1>
          <p className="text-white/70">{order.title}</p>
        </div>
      </motion.div>

      {/* Order Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-2">{order.title}</h2>
            <p className="text-white/70 mb-4">{order.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-white/70">
                <Clock className="w-5 h-5" />
                <span>{order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU') : 'Не указано'}</span>
              </div>
              <div className="flex items-center space-x-2 text-white/70">
                <MessageCircle className="w-5 h-5" />
                <span>{responses.length} откликов</span>
              </div>
            </div>

            {/* Фотографии заявки */}
            {order.images && order.images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-white/70 mb-2">Фотографии заявки:</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {order.images.map((image: string, index: number) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-white/5">
                      <img
                        src={`https://mebelplace.com.kz${image}`}
                        alt={`Фото ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => window.open(`https://mebelplace.com.kz${image}`, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Responses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-bold text-white">Предложения мастеров</h3>
        
        {responses.length === 0 ? (
          <GlassCard>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-white/70 mb-2">Пока нет откликов</h3>
              <p className="text-white/50">Мастера еще не оставили предложения по вашей заявке</p>
            </div>
          </GlassCard>
        ) : (
          responses.map((response, index) => (
            <motion.div
              key={response.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard variant="hover">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => navigate(`/master/${response.master?.id}`)}
                        className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold"
                        aria-label="Канал мастера"
                      >
                        {response.master?.name?.charAt(0).toUpperCase() || 'M'}
                      </button>
                      <div>
                        <h4 className="font-bold text-white">{response.master?.name || 'Мастер'}</h4>
                        <div className="flex items-center space-x-2 text-sm text-white/60">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                          <span>•</span>
                          <span>15 отзывов</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-white/60">Предложено</p>
                      <p className="text-xs text-white/40">{formatTime(response.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-white/80 mb-3">{response.message}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {response.price && (
                      <div className="flex items-center space-x-2 text-white/70">
                        <span className="font-medium">Цена: {response.price.toLocaleString()} ₸</span>
                      </div>
                    )}
                    {response.deadline && (
                      <div className="flex items-center space-x-2 text-white/70">
                        <Clock className="w-5 h-5" />
                        <span>{new Date(response.deadline).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        try {
                          console.log('🔍 Creating chat with master:', response.master?.id)
                          console.log('🔍 Master object:', response.master)
                          if (!response.master?.id && !response.masterId) {
                            console.error('❌ No master ID found!')
                            alert('Ошибка: ID мастера не найден')
                            return
                          }
                          const masterId = response.master?.id || response.masterId
                          const chat = await chatService.createChatWithUser(masterId)
                          console.log('🔍 Chat created:', chat)
                          navigate(`/chat/${chat.id}`)
                        } catch (e) {
                          console.error('Failed to start chat:', e)
                          alert('Ошибка при создании чата')
                        }
                      }}
                      className="glass-button px-4 py-2 text-sm"
                    >
                      Написать мастеру
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const masterId = response.master?.id || response.masterId
                        console.log('🔍 Navigating to master profile:', masterId)
                        if (!masterId) {
                          console.error('❌ No master ID!')
                          alert('Ошибка: ID мастера не найден')
                          return
                        }
                        navigate(`/master/${masterId}`)
                      }}
                      className="glass-button px-4 py-2 text-sm"
                    >
                      Профиль мастера
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAcceptResponse(response.id)}
                      disabled={acceptingResponse === response.id}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {acceptingResponse === response.id ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                          />
                          <span>Принимаем...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Принять предложение</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}

export default OrderResponsesPage
