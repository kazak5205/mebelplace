import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, MessageCircle, Clock, CheckCircle, AlertCircle, X } from 'lucide-react'

interface SupportTicket {
  id: string
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'closed'
  created_at: string
  updated_at: string
  responses?: SupportResponse[]
}

interface SupportResponse {
  id: string
  message: string
  user_id: string
  created_at: string
  username: string
  first_name: string
  last_name: string
  avatar: string
}

const SupportTicketsPage: React.FC = () => {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newResponse, setNewResponse] = useState('')
  const [sendingResponse, setSendingResponse] = useState(false)
  const [creatingTicket, setCreatingTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      setLoading(true)
      // ✅ Токен в httpOnly cookie
      const response = await fetch('https://mebelplace.com.kz/api/support/tickets', {
        credentials: 'include'
      })
      const data = await response.json()
      setTickets(data.data.tickets || [])
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTicketDetails = async (ticketId: string) => {
    try {
      // ✅ Токен в httpOnly cookie
      const response = await fetch(`https://mebelplace.com.kz/api/support/tickets/${ticketId}`, {
        credentials: 'include'
      })
      const data = await response.json()
      setSelectedTicket(data.data)
    } catch (error) {
      console.error('Failed to load ticket details:', error)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreatingTicket(true)
      // ✅ Токен в httpOnly cookie
      const response = await fetch('https://mebelplace.com.kz/api/support/tickets', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTicket)
      })
      
      if (response.ok) {
        setShowCreateModal(false)
        setNewTicket({ subject: '', message: '', priority: 'medium' })
        await loadTickets()
      }
    } catch (error) {
      console.error('Failed to create ticket:', error)
    } finally {
      setCreatingTicket(false)
    }
  }

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !newResponse.trim()) return

    try {
      setSendingResponse(true)
      // ✅ Токен в httpOnly cookie
      const response = await fetch(`https://mebelplace.com.kz/api/support/tickets/${selectedTicket.id}/responses`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newResponse.trim() })
      })
      
      if (response.ok) {
        setNewResponse('')
        await loadTicketDetails(selectedTicket.id)
      }
    } catch (error) {
      console.error('Failed to send response:', error)
    } finally {
      setSendingResponse(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Открыт'
      case 'in_progress':
        return 'В работе'
      case 'closed':
        return 'Закрыт'
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/user/messenger')}
            className="glass-button p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold gradient-text">Поддержка</h1>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="glass-button flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Новый тикет</span>
        </motion.button>
      </motion.div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white/70 mb-2">
              Нет тикетов поддержки
            </h3>
            <p className="text-white/50">
              Создайте первый тикет для получения помощи
            </p>
          </motion.div>
        ) : (
          tickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className="glass-card p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => {
                  setSelectedTicket(ticket)
                  loadTicketDetails(ticket.id)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(ticket.status)}
                      <h3 className="font-medium text-white">{ticket.subject}</h3>
                      <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mb-2 line-clamp-2">
                      {ticket.message}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-white/50">
                      <span>{getStatusText(ticket.status)}</span>
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                  </div>
                  <MessageCircle className="w-5 h-5 text-white/40" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Новый тикет</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="glass-button p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Тема *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  required
                  placeholder="Краткое описание проблемы"
                  className="glass-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Приоритет
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                  className="glass-input w-full"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Описание *
                </label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  required
                  rows={4}
                  placeholder="Подробно опишите вашу проблему..."
                  className="glass-input w-full resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="glass-button"
                >
                  Отмена
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={creatingTicket}
                  className="glass-button bg-gradient-to-r from-blue-500 to-blue-600 disabled:opacity-50"
                >
                  {creatingTicket ? 'Создание...' : 'Создать'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{selectedTicket.subject}</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="glass-button p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Ticket Info */}
              <div className="flex items-center space-x-4 text-sm text-white/60">
                <span>Статус: {getStatusText(selectedTicket.status)}</span>
                <span>Приоритет: {selectedTicket.priority.toUpperCase()}</span>
                <span>Создан: {formatDate(selectedTicket.created_at)}</span>
              </div>

              {/* Original Message */}
              <div className="glass-card p-4">
                <h4 className="font-medium text-white mb-2">Описание проблемы:</h4>
                <p className="text-white/80 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              {/* Responses */}
              {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-white">Ответы:</h4>
                  {selectedTicket.responses.map((response) => (
                    <div key={response.id} className="glass-card p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {response.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {response.first_name} {response.last_name}
                          </p>
                          <p className="text-sm text-white/50">
                            {formatDate(response.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="text-white/80 whitespace-pre-wrap">{response.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Response Form */}
              <form onSubmit={handleSendResponse} className="space-y-3">
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Добавить ответ..."
                  rows={3}
                  className="glass-input w-full resize-none"
                />
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!newResponse.trim() || sendingResponse}
                    className="glass-button bg-gradient-to-r from-blue-500 to-blue-600 disabled:opacity-50"
                  >
                    {sendingResponse ? 'Отправка...' : 'Отправить'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default SupportTicketsPage
