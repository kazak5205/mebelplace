import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from '@shared/components'
import { authService } from '../../services/authService'
import { useToast } from '../Toast'

interface LocationState {
  phone: string
}

const SmsVerification: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState
  const toast = useToast()
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    if (!state?.phone) {
      navigate('/register')
      return
    }

    // Countdown для повторной отправки
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, state?.phone, navigate])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      toast.error('Введите 6-значный код', 3000)
      return
    }

    try {
      setIsVerifying(true)
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: state.phone, code })
      })

      const data = await response.json()

      if (response.ok && data.verified) {
        toast.success('Номер телефона подтвержден!', 3000)
        // После успешной верификации переходим на главную
        navigate('/')
      } else {
        toast.error(data.error || 'Неверный код', 4000)
      }
    } catch (error) {
      console.error('SMS verification error:', error)
      toast.error('Ошибка при проверке кода', 4000)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    try {
      setIsResending(true)
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: state.phone })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Код отправлен повторно', 3000)
        setCountdown(60)
      } else {
        toast.error(data.error || 'Ошибка при отправке кода', 4000)
      }
    } catch (error) {
      console.error('SMS resend error:', error)
      toast.error('Ошибка при отправке кода', 4000)
    } finally {
      setIsResending(false)
    }
  }

  const handleCodeChange = (value: string) => {
    // Только цифры, максимум 6
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setCode(numericValue)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center"
          >
            <Icon name="MAIL" size={40} className="text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Подтверждение номера</h2>
          <p className="text-white/70">
            Мы отправили код на номер
            <br />
            <span className="font-semibold text-white">{state?.phone}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-white/90 mb-2 text-sm font-medium">
              Введите 6-значный код
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
              disabled={isVerifying}
            />
          </div>

          <motion.button
            type="submit"
            disabled={isVerifying || code.length !== 6}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Проверка...' : 'Подтвердить'}
          </motion.button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-white/60 text-sm">
                Отправить код повторно через {countdown} сек
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-orange-400 hover:text-orange-300 text-sm font-medium disabled:opacity-50"
              >
                {isResending ? 'Отправка...' : 'Отправить код повторно'}
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-white/60 hover:text-white text-sm"
          >
            ← Вернуться к регистрации
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default SmsVerification

