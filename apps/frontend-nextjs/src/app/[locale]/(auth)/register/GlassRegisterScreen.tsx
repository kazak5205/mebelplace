'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton, 
  GlassInput 
} from '@/components/ui/glass';

export default function GlassRegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    role: 'buyer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'register' | 'verify'>('register');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    try {
      // API integration - using mock data structure matching API types
      console.log('Register attempt:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep('verify');
    } catch (err) {
      setError('Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`
          }} />
        </div>

        <div className="relative w-full max-w-md">
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardHeader>
              <div className="w-16 h-16 glass-bg-accent-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <GlassCardTitle level={1} className="text-2xl mb-2">
                Подтвердите email
              </GlassCardTitle>
              <p className="glass-text-secondary">
                Мы отправили код подтверждения на {formData.email}
              </p>
            </GlassCardHeader>

            <GlassCardContent>
              <div className="space-y-4">
                <GlassInput
                  name="verificationCode"
                  type="text"
                  label="Код подтверждения"
                  placeholder="000000"
                  maxLength={6}
                />

                <GlassButton
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/feed')}
                >
                  Подтвердить
                </GlassButton>

                <GlassButton
                  variant="ghost"
                  size="md"
                  className="w-full"
                  onClick={() => setStep('register')}
                >
                  ← Назад к регистрации
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 165, 0, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative w-full max-w-md">
        <GlassCard variant="elevated" padding="xl" className="text-center">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="text-3xl mb-2">
              Создать аккаунт
            </GlassCardTitle>
            <p className="glass-text-secondary">
              Присоединяйтесь к MebelPlace
            </p>
          </GlassCardHeader>

          <GlassCardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 glass-bg-secondary rounded-lg border border-red-400/30">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <GlassInput
                name="email"
                type="email"
                label="Email"
                placeholder="your@email.com"
                value={formData.email}
                onValueChange={(value) => setFormData({...formData, email: value})}
                required
              />

              <GlassInput
                name="username"
                type="text"
                label="Имя пользователя"
                placeholder="Ваше имя"
                value={formData.username}
                onValueChange={(value) => setFormData({...formData, username: value})}
                required
              />

              <GlassInput
                name="password"
                type="password"
                label="Пароль"
                placeholder="••••••••"
                value={formData.password}
                onValueChange={(value) => setFormData({...formData, password: value})}
                required
              />

              <GlassInput
                name="confirmPassword"
                type="password"
                label="Подтвердите пароль"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onValueChange={(value) => setFormData({...formData, confirmPassword: value})}
                required
              />

              <div className="glass-bg-secondary rounded-lg p-4">
                <label className="block text-sm font-medium glass-text-primary mb-3">
                  Выберите роль
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="buyer">Покупатель</option>
                  <option value="master">Мастер</option>
                </select>
              </div>

              <GlassButton
                type="submit"
                variant="gradient"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {loading ? 'Создаем аккаунт...' : 'Создать аккаунт'}
              </GlassButton>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="glass-text-secondary text-sm mb-4">
                Уже есть аккаунт?
              </p>
              
              <GlassButton
                variant="ghost"
                size="md"
                className="w-full"
                onClick={() => router.push('/login')}
              >
                Войти
              </GlassButton>
            </div>

            {/* Social Registration */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="glass-text-muted px-2 bg-transparent">
                    Или зарегистрируйтесь через
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <GlassButton
                  variant="secondary"
                  size="md"
                  className="flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </GlassButton>

                <GlassButton
                  variant="secondary"
                  size="md"
                  className="flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"/>
                  </svg>
                  Facebook
                </GlassButton>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
