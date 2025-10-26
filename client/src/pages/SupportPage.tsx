import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MessageCircle, Clock, Send, Ticket, AlertCircle, CheckCircle } from 'lucide-react'
import { apiService } from '../services/api'

interface SupportInfo {
  support_phone: { phone: string; formatted: string }
  support_email: { email: string }
  support_hours: { timezone: string; schedule: string }
  support_contacts: { whatsapp: string; telegram: string }
}

interface SupportTicket {
  id: string
  subject: string
  status: string
  priority: string
  category: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

const SupportPage: React.FC = () => {
  const [supportInfo, setSupportInfo] = useState<SupportInfo | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadSupportInfo()
    loadTickets()
  }, [])

  const loadSupportInfo = async () => {
    try {
      const response = await apiService.get('/support/info') as any
      setSupportInfo(response.data.data)
    } catch (error) {
      console.error('Failed to load support info:', error)
    }
  }

  const loadTickets = async () => {
    try {
      const response = await apiService.get('/support/tickets') as any
      setTickets(response.data.data)
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject || !formData.message) return

    try {
      setSubmitting(true)
      await apiService.post('/support/contact', formData)
      setFormData({ subject: '', message: '', priority: 'medium', category: 'general' })
      setShowContactForm(false)
      loadTickets() // Reload tickets
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send message')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-yellow-400'
      case 'in_progress': return 'text-blue-400'
      case 'resolved': return 'text-green-400'
      case 'closed': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      case 'closed': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'urgent': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center"
      >
        <h1 className="text-3xl font-bold gradient-text text-center">Поддержка</h1>
      </motion.div>

      {/* Support Information */}
      {supportInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Contact Info */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-orange-500" />
              Контакты
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-orange-500" />
                <a 
                  href={`tel:${supportInfo.support_phone.phone}`}
                  className="text-white hover:text-orange-400 transition-colors"
                >
                  {supportInfo.support_phone.formatted}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-orange-500" />
                <a 
                  href={`mailto:${supportInfo.support_email.email}`}
                  className="text-white hover:text-orange-400 transition-colors"
                >
                  {supportInfo.support_email.email}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-white/80">
                  {supportInfo.support_hours.schedule}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-orange-500" />
              Быстрые действия
            </h2>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowContactForm(true)}
                className="w-full glass-button flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Написать в поддержку</span>
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={`https://wa.me/${supportInfo.support_contacts.whatsapp.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full glass-button flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </motion.a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowContactForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Написать в поддержку</h3>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Тема</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="glass-input w-full"
                  placeholder="Краткое описание проблемы"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Приоритет</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="glass-input w-full"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="urgent">Срочный</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Категория</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="glass-input w-full"
                >
                  <option value="general">Общие вопросы</option>
                  <option value="technical">Техническая поддержка</option>
                  <option value="billing">Биллинг</option>
                  <option value="feature_request">Запрос функции</option>
                  <option value="bug_report">Сообщение об ошибке</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Сообщение</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="glass-input w-full h-32 resize-none"
                  placeholder="Подробно опишите вашу проблему или вопрос"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="flex-1 glass-button flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Отправка...' : 'Отправить'}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-4 py-2 text-white/80 hover:text-white transition-colors"
                >
                  Отмена
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Tickets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Ticket className="w-5 h-5 mr-2 text-orange-500" />
            Мои обращения
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowContactForm(true)}
            className="glass-button flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Новое обращение</span>
          </motion.button>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">У вас пока нет обращений в поддержку</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{ticket.subject}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)} bg-white/10`}>
                      {ticket.priority}
                    </span>
                    <div className={`flex items-center space-x-1 ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      <span className="text-sm">{ticket.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>#{ticket.id.slice(0, 8)}</span>
                  <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default SupportPage
