import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, Lock, Eye, EyeOff, User, Users } from 'lucide-react'
// import { useAuth } from '../contexts/AuthContext'

const RegisterPage = () => {
    const [accountType, setAccountType] = useState('user')
    const [phone, setPhone] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    // const authContext = useAuth()
    
    
    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setError('')
        
        console.log('Form submitted!')
        
        // Валидация
        if (password !== confirmPassword) {
            setError('Пароли не совпадают')
            return
        }
        if (password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов')
            return
        }
        
        setLoading(true)
        try {
            // Отправляем SMS код
            const response = await fetch('https://mebelplace.com.kz/api/auth/send-sms-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone })
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to send SMS code')
            }
            
            const result = await response.json()
            console.log('SMS code sent:', result)
            
            // Сохраняем данные формы в localStorage
            const formData = {
                phone,
                username,
                password,
                role: accountType as 'user' | 'master' | 'admin'
            }
            
            localStorage.setItem('registrationData', JSON.stringify(formData))
            
            // Переходим на страницу верификации SMS
            navigate('/sms-verification', {
                state: {
                    phone
                }
            })
        } catch (err: any) {
            setError(err.message || 'Ошибка отправки SMS')
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 md:px-6 py-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-md"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Регистрация
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Создайте аккаунт для доступа к платформе
                        </p>
                    </div>
                    
                    {/* Account Type */}
                    <div>
                        <label className="block text-white text-sm md:text-base mb-2">
                            Тип аккаунта *
                        </label>
                        <select
                            value={accountType}
                            onChange={(e: any) => setAccountType(e.target.value)}
                            className="w-full px-4 py-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                        >
                            <option value="user">Клиент</option>
                            <option value="master">Мастер</option>
                        </select>
                    </div>
                    
                    {/* Phone Number */}
                    <div>
                        <label className="block text-white text-sm md:text-base mb-2">
                            Номер телефона *
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={phone}
                                onChange={(e: any) => setPhone(e.target.value)}
                                placeholder="+7XXXXXXXXXX"
                                className="w-full pl-10 pr-4 py-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                required
                            />
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                            Формат: +7XXXXXXXXXX или 8XXXXXXXXXX
                        </p>
                    </div>
                    
                    {/* Username */}
                    <div>
                        <label className="block text-white text-sm md:text-base mb-2">
                            Имя пользователя *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e: any) => setUsername(e.target.value)}
                                placeholder="username"
                                className="w-full pl-10 pr-4 py-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                required
                            />
                        </div>
                    </div>
                    
                    {/* Password */}
                    <div>
                        <label className="block text-white text-sm md:text-base mb-2">
                            Пароль *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e: any) => setPassword(e.target.value)}
                                placeholder="Минимум 6 символов"
                                className="w-full pl-10 pr-12 py-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 p-1"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Confirm Password */}
                    <div>
                        <label className="block text-white text-sm md:text-base mb-2">
                            Подтвердите пароль *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e: any) => setConfirmPassword(e.target.value)}
                                placeholder="Повторите пароль"
                                className="w-full pl-10 pr-12 py-3 text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 p-1"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
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
                        className="w-full py-3 text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Отправка SMS...' : 'Отправить SMS'}
                    </button>
                    
                    {/* Login Link */}
                    <div className="text-center text-sm">
                        <span className="text-gray-400">
                            Уже есть аккаунт?{' '}
                        </span>
                        <Link 
                            to="/login" 
                            className="text-orange-500 hover:text-orange-400 transition-colors"
                        >
                            Войти
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default RegisterPage
