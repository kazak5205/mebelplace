import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Phone, ArrowLeft, Building2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const SmsVerificationPage = () => {
    const [step, setStep] = useState<'sms' | 'company'>('sms')
    const [smsCode, setSmsCode] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [resendLoading, setResendLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    
    const navigate = useNavigate()
    const location = useLocation()
    const { verifySmsCode, sendSmsCode } = useAuth()
    
    // Получаем данные из location.state и localStorage
    const phone = location.state?.phone
    const formData = JSON.parse(localStorage.getItem('registrationData') || '{}')
    
    useEffect(() => {
        if (!formData || !phone) {
            navigate('/register')
            return
        }
    }, [formData, phone, navigate])
    
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])
    
    // Функция создания пользователя
    const createUser = async (data: any) => {
        const response = await fetch('https://mebelplace.com.kz/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // ✅ ВАЖНО: для установки cookies
            body: JSON.stringify(data)
        })
        
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to create user')
        }
        
        const result = await response.json()
        console.log('User created:', result)
        
        // Очищаем данные регистрации из localStorage
        localStorage.removeItem('registrationData')
        
        // Даём время на установку cookies и перезагружаем
        setTimeout(() => {
            window.location.href = '/'
        }, 100)
    }
    
    // Обработка SMS кода
    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setError('')
        
        if (!smsCode.trim()) {
            setError('Введите SMS код')
            return
        }
        
        setLoading(true)
        try {
            // Верифицируем SMS код
            await verifySmsCode(phone, smsCode)
            
            // Если мастер - переходим к шагу с названием компании
            if (formData.role === 'master') {
                setStep('company')
                setLoading(false)
                return
            }
            
            // Если клиент - сразу создаем пользователя
            await createUser(formData)
        } catch (err: any) {
            setError(err.message || 'Неверный SMS код')
            setLoading(false)
        }
    }
    
    // Обработка названия компании (для мастеров)
    const handleCompanySubmit = async (e: any) => {
        e.preventDefault()
        setError('')
        
        if (!companyName.trim()) {
            setError('Введите название компании')
            return
        }
        
        setLoading(true)
        try {
            await createUser({
                ...formData,
                companyName: companyName
            })
        } catch (err: any) {
            setError(err.message || 'Ошибка создания аккаунта')
            setLoading(false)
        }
    }
    
    const handleResend = async () => {
        setResendLoading(true)
        setError('')
        
        try {
            await sendSmsCode(phone)
            setCountdown(60) // 60 секунд до возможности повторной отправки
        } catch (err: any) {
            setError(err.message || 'Ошибка отправки SMS')
        } finally {
            setResendLoading(false)
        }
    }
    
    if (!formData || !phone) {
        return null
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {step === 'sms' ? (
                    /* Шаг 1: SMS Верификация */
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Phone className="w-8 h-8 text-orange-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    Подтверждение номера
                                </h1>
                                <p className="text-gray-400">
                                    Введите код из SMS, отправленного на номер
                                </p>
                                <p className="text-white font-medium mt-1">{phone}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                SMS код <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={smsCode}
                                onChange={(e) => setSmsCode(e.target.value)}
                                placeholder="Введите 6-значный код"
                                maxLength={6}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors text-center text-2xl tracking-widest"
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !smsCode}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Проверка...' : 'Подтвердить'}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading || countdown > 0}
                            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500"
                        >
                            {resendLoading ? 'Отправка...' : countdown > 0 ? `Отправить повторно через ${countdown}с` : 'Отправить код повторно'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="w-full py-3 text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Назад к регистрации
                        </button>
                    </form>
                ) : (
                    /* Шаг 2: Название компании (только для мастеров) */
                    <form onSubmit={handleCompanySubmit} className="space-y-6">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-orange-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    Название компании
                                </h1>
                                <p className="text-gray-400">
                                    Укажите название вашей компании или мастерской
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Название компании <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <Building2 className="w-5 h-5 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="ИП Иванов или ТОО Мебель+"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !companyName.trim()}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Создание аккаунта...' : 'Завершить регистрацию'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('sms')}
                            disabled={loading}
                            className="w-full py-3 text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Назад
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    )
}

export default SmsVerificationPage
