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

export default function GlassForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API integration - using mock data structure matching API types
      console.log('Forgot password request:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
    } catch (err) {
      setError('Ошибка отправки письма. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
              <div className="w-16 h-16 glass-bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <GlassCardTitle level={1} className="text-2xl mb-2">
                Письмо отправлено!
              </GlassCardTitle>
              <p className="glass-text-secondary">
                Проверьте почту {email} и следуйте инструкциям для восстановления пароля
              </p>
            </GlassCardHeader>

            <GlassCardContent>
              <div className="space-y-4">
                <GlassButton
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/login')}
                >
                  Вернуться к входу
                </GlassButton>

                <GlassButton
                  variant="ghost"
                  size="md"
                  className="w-full"
                  onClick={() => setSuccess(false)}
                >
                  Отправить еще раз
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
              Забыли пароль?
            </GlassCardTitle>
            <p className="glass-text-secondary">
              Введите email и мы отправим ссылку для восстановления
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
                value={email}
                onValueChange={setEmail}
                required
              />

              <GlassButton
                type="submit"
                variant="gradient"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {loading ? 'Отправляем...' : 'Отправить ссылку'}
              </GlassButton>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <GlassButton
                variant="ghost"
                size="md"
                className="w-full"
                onClick={() => router.push('/login')}
              >
                ← Вернуться к входу
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
