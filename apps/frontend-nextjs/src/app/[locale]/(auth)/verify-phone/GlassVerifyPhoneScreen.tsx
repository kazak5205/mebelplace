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

export default function GlassVerifyPhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [timeLeft, setTimeLeft] = useState(60);

  // Countdown timer
  React.useEffect(() => {
    if (timeLeft > 0 && step === 'verify') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic phone validation
    const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    if (!phoneRegex.test(phone)) {
      setError('Введите корректный номер телефона');
      setLoading(false);
      return;
    }

    try {
      // API integration - using mock data structure matching API types
      console.log('Phone verification request:', phone);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('verify');
      setTimeLeft(60);
    } catch (err) {
      setError('Ошибка отправки SMS. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
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
      console.log('Phone verification code:', code);
      
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
      console.log('Resending SMS code to:', phone);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('Ошибка отправки кода. Попробуйте еще раз.');
    }
  };

  if (step === 'verify') {
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
                SMS отправлено на {phone}
              </p>
            </GlassCardHeader>

            <GlassCardContent>
              <form onSubmit={handleCodeSubmit} className="space-y-6">
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
                  onClick={() => setStep('phone')}
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
            <div className="w-16 h-16 glass-bg-accent-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <GlassCardTitle level={1} className="text-2xl mb-2">
              Подтвердите телефон
            </GlassCardTitle>
            <p className="glass-text-secondary">
              Введите номер телефона для получения SMS кода
            </p>
          </GlassCardHeader>

          <GlassCardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              {error && (
                <div className="p-3 glass-bg-secondary rounded-lg border border-red-400/30">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <GlassInput
                name="phone"
                type="tel"
                label="Номер телефона"
                placeholder="+7 (777) 123-45-67"
                value={phone}
                onValueChange={setPhone}
                required
              />

              <GlassButton
                type="submit"
                variant="gradient"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {loading ? 'Отправляем SMS...' : 'Отправить SMS'}
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
