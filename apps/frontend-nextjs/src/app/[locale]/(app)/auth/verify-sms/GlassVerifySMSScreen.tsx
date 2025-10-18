'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton,
  GlassInput 
} from '@/components/ui/glass';
import { useAuth } from '@/lib/api/hooks';

export default function GlassVerifySMSScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [phone] = useState('+7 777 123 45 67'); // TODO: Get from URL params
  
  const { verifySMS } = useAuth();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await verifySMS(phone, code);
      
      if (response.success) {
        window.location.href = '/';
      } else {
        setError(response.error || 'Неверный код');
      }
    } catch (error) {
      setError('Произошла ошибка при подтверждении');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);

    try {
      // TODO: Implement resendSMSCode API call
      setTimeLeft(60);
    } catch (error) {
      setError('Произошла ошибка при отправке SMS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
      <GlassCard variant="elevated" padding="xl" className="w-full max-w-md">
        <GlassCardHeader>
          <GlassCardTitle level={1} className="text-center">Подтверждение номера</GlassCardTitle>
          <p className="glass-text-secondary text-center mt-2">
            Мы отправили SMS с кодом на номер {phone}
          </p>
        </GlassCardHeader>
        
        <GlassCardContent>
          {error && (
            <div className="glass-bg-danger glass-border rounded-lg p-3 mb-4">
              <p className="text-white text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <GlassInput
              label="Код подтверждения"
              value={code}
              onValueChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              required
              disabled={loading}
              className="text-center text-2xl tracking-widest"
            />
            
            <GlassButton 
              type="submit" 
              variant="gradient" 
              size="lg" 
              className="w-full"
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Подтверждение...' : 'Подтвердить'}
            </GlassButton>
          </form>
          
          <div className="mt-6 text-center space-y-3">
            {timeLeft > 0 ? (
              <p className="glass-text-muted">
                Отправить код повторно через {timeLeft} сек
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="glass-text-accent-blue-500 hover:glass-text-accent-blue-400 transition-colors"
              >
                Отправить код повторно
              </button>
            )}
            <div className="glass-text-muted">
              Не приходит код? <a href="/support" className="glass-text-accent-orange-500 hover:glass-text-accent-orange-400 transition-colors">Связаться с поддержкой</a>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}