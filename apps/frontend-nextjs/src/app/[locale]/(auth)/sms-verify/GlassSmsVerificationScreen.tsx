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

export default function GlassSmsVerificationScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  // Countdown timer
  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (code.length !== 6) {
      setError('Код должен содержать 6 цифр');
      setLoading(false);
      return;
    }

    try {
      // API integration - using mock data structure matching API types
      console.log('SMS verification:', code);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/feed');
    } catch (err) {
      setError('Неверный код. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setTimeLeft(60);
    try {
      // API integration - using mock data structure matching API types
      console.log('Resending SMS code');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('Ошибка отправки кода. Попробуйте еще раз.');
    }
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative w-full max-w-md">
        <GlassCard variant="elevated" padding="xl" className="text-center">
          <GlassCardHeader>
            <div className="w-16 h-16 glass-bg-accent-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <GlassCardTitle level={1} className="text-2xl mb-2">
              Подтвердите номер
            </GlassCardTitle>
            <p className="glass-text-secondary">
              Мы отправили SMS с кодом подтверждения на ваш номер телефона
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
                name="code"
                type="text"
                label="SMS код"
                placeholder="000000"
                value={code}
                onValueChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                className="text-center text-2xl tracking-widest"
              />

              <GlassButton
                type="submit"
                variant="gradient"
                size="lg"
                loading={loading}
                className="w-full"
                disabled={code.length !== 6}
              >
                {loading ? 'Проверяем...' : 'Подтвердить'}
              </GlassButton>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="glass-text-secondary text-sm mb-4">
                Не получили код?
              </p>
              
              <GlassButton
                variant="ghost"
                size="md"
                className="w-full"
                onClick={handleResendCode}
                disabled={timeLeft > 0}
              >
                {timeLeft > 0 ? `Отправить повторно (${timeLeft}с)` : 'Отправить повторно'}
              </GlassButton>

              <GlassButton
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => router.push('/register')}
              >
                ← Изменить номер
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
