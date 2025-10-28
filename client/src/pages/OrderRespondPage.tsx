import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MessageSquare } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { orderService } from '../services/orderService'
import { useAuth } from '../contexts/AuthContext'
import { pluralizeResponses } from '../utils/pluralize'

const OrderRespondPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    message: '',
    price: '',
    deadline: ''
  })

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const response = await orderService.getOrder(id!)
      console.log('🔍 OrderRespondPage - Loaded order:', response)
      console.log('🔍 OrderRespondPage - Responses:', response?.responses)
      console.log('🔍 OrderRespondPage - Responses length:', response?.responses?.length)
      setOrder(response)
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.message.trim()) {
      setError('Пожалуйста, заполните сообщение')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      
      const responseData = {
        message: formData.message.trim(),
        price: formData.price ? parseFloat(formData.price) : undefined,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined
      }

      console.log('Sending response:', responseData)
      await orderService.createResponse(id!, responseData)
      
      // Переходим обратно к заявкам
      navigate('/orders')
    } catch (error: any) {
      console.error('Failed to submit response:', error)
      setError(error?.response?.data?.message || error?.message || 'Не удалось отправить предложение. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
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

  // Проверка роли - только мастера могут откликаться
  if (user && user.role !== 'master' && user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-white/70 mb-4">Доступ запрещён</h3>
        <p className="text-white/50 mb-4">Только мастера могут откликаться на заявки</p>
        <button
          onClick={() => navigate('/user/orders')}
          className="glass-button px-4 py-2"
        >
          К моим заявкам
        </button>
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
          <h1 className="text-3xl font-bold gradient-text">Оставить предложение</h1>
          <p className="text-white/70">Ответьте на заявку клиента</p>
        </div>
      </motion.div>

      {/* Order Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-2">{order.title}</h2>
            <p className="text-white/70 mb-4">{order.description}</p>
            
            {/* Фотографии заявки клиента */}
            {order.images && order.images.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-white/70 mb-2">Фотографии клиента:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {order.images.map((image: string, index: number) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-white/5">
                      <img
                        src={`https://mebelplace.com.kz${image}`}
                        alt={`Фото ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-white/70">
              <MessageSquare className="w-5 h-5" />
              <span>{pluralizeResponses(order.responses?.length || 0)}</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Response Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Ваше предложение</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Сообщение клиенту *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Опишите, как вы планируете выполнить заказ, какие материалы будете использовать, ваш опыт в подобных работах..."
                  className="w-full glass-input min-h-[120px] resize-none"
                  required
                />
                <p className="text-xs text-white/50 mt-1">
                  Чем подробнее опишете ваше предложение, тем больше шансов, что клиент выберет именно вас
                </p>
              </div>

              {/* Price and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Ваша цена (₸)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Укажите стоимость"
                    className="w-full glass-input"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Срок выполнения
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full glass-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Tips */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-300 mb-2">💡 Советы для успешного отклика:</h4>
                <ul className="text-sm text-blue-200/80 space-y-1">
                  <li>• Опишите ваш опыт в подобных работах</li>
                  <li>• Укажите, какие материалы планируете использовать</li>
                  <li>• Предложите несколько вариантов решения</li>
                  <li>• Приложите фото ваших предыдущих работ (если есть)</li>
                  <li>• Будьте готовы ответить на вопросы клиента</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/orders')}
                  className="glass-button px-6 py-3"
                >
                  Отмена
                </motion.button>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!formData.message.trim() || submitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                      />
                      <span>Отправляем...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Отправить предложение</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default OrderRespondPage
