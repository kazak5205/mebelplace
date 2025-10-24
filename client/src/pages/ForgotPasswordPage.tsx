import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Phone, ArrowLeft, Lock } from 'lucide-react'
import { authService } from '../services/authService'

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.forgotPassword(phone)
      setStep('code')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ошибка отправки кода')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (newPassword.length < 6) {
      setError('Пароль должен быть минимум 6 символов')
      return
    }

    setLoading(true)

    try {
      await authService.resetPassword(phone, code, newPassword)
      alert('Пароль успешно изменен!')
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ошибка сброса пароля')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Header with Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4">
              <Lock className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Восстановление пароля</h2>
            <p className="text-gray-400 text-sm">Введите номер телефона для получения SMS кода</p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              {/* Phone Number */}
              <div>
                <label className="block text-white text-sm mb-2">Номер телефона</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7XXXXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">Формат: +7XXXXXXXXXX или 8XXXXXXXXXX</p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Отправка...' : 'Отправить SMS код'}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all border border-gray-700"
              >
                <ArrowLeft className="inline mr-2" size={16} />
                Вернуться к входу
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Success message */}
              <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm">
                SMS код отправлен на номер: {phone}
              </div>

              {/* SMS Code */}
              <div>
                <label className="block text-white text-sm mb-2">SMS код</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Введите 4-значный код"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors text-center text-2xl tracking-widest"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-white text-sm mb-2">Новый пароль</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-white text-sm mb-2">Подтвердите пароль</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите пароль"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Сброс пароля...' : 'Сбросить пароль'}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all border border-gray-700"
              >
                <ArrowLeft className="inline mr-2" size={16} />
                Назад
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
