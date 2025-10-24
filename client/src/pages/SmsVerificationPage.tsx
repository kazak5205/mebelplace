import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SmsVerificationPage = () => {
    const [smsCode, setSmsCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { verifySmsCode, sendSmsCode } = useAuth();
    
    // Получаем данные из location.state и localStorage
    const phone = location.state?.phone;
    const formData = JSON.parse(localStorage.getItem('registrationData') || '{}');
    
    useEffect(() => {
        if (!formData || !phone) {
            navigate('/register');
            return;
        }
    }, [formData, phone, navigate]);
    
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);
    
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');
        
        if (!smsCode.trim()) {
            setError('Введите SMS код');
            return;
        }
        
        setLoading(true);
        try {
            // Верифицируем SMS код
            await verifySmsCode(phone, smsCode);
            
            // После успешной верификации создаем пользователя
            const response = await fetch('https://mebelplace.com.kz/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create user');
            }
            
            const result = await response.json();
            console.log('User created:', result);
            
            // Сохраняем токены из ответа
            if (result.data?.accessToken) {
                localStorage.setItem('accessToken', result.data.accessToken);
            }
            if (result.data?.refreshToken) {
                localStorage.setItem('refreshToken', result.data.refreshToken);
            }
            
            // Очищаем данные регистрации из localStorage
            localStorage.removeItem('registrationData');
            
            // Перезагружаем страницу чтобы AuthContext подхватил токены
            window.location.href = '/';
        } catch (err: any) {
            setError(err.message || 'Неверный SMS код');
        } finally {
            setLoading(false);
        }
    };
    
    const handleResend = async () => {
        setResendLoading(true);
        setError('');
        
        try {
            await sendSmsCode(phone);
            setCountdown(60); // 60 секунд до возможности повторной отправки
        } catch (err: any) {
            setError(err.message || 'Ошибка отправки SMS');
        } finally {
            setResendLoading(false);
        }
    };
    
    if (!formData || !phone) {
        return null;
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-md"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Phone className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Подтверждение номера
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Введите код из SMS, отправленного на номер
                        </p>
                        <p className="text-orange-500 font-medium">
                            {phone}
                        </p>
                    </div>
                    
                    {/* SMS Code Input */}
                    <div>
                        <label className="block text-white text-sm mb-2">
                            SMS код *
                        </label>
                        <input
                            type="text"
                            value={smsCode}
                            onChange={(e: any) => setSmsCode(e.target.value)}
                            placeholder="Введите 6-значный код"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors text-center text-lg tracking-widest"
                            maxLength={6}
                            required
                        />
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
                        {loading ? 'Проверка...' : 'Подтвердить'}
                    </button>
                    
                    {/* Resend Button */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading || countdown > 0}
                            className="text-orange-500 hover:text-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendLoading ? 'Отправка...' : 
                             countdown > 0 ? `Повторить через ${countdown}с` : 
                             'Отправить код повторно'}
                        </button>
                    </div>
                    
                    {/* Back Button */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Назад к регистрации
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SmsVerificationPage;
