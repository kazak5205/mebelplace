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

export default function GlassVerifyEmailScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [email] = useState('user@example.com'); // TODO: Get from URL params
  
  const { verifyEmail } = useAuth();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await verifyEmail(email, code);
      
      if (response.success) {
        window.location.href = '/auth/login';
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
      // TODO: Implement resendEmailCode API call
      setTimeLeft(300);
    } catch (error) {
      setError('Произошла ошибка при отправке кода');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
      <GlassCard variant="elevated" padding="xl" className="w-full max-w-md">
        <GlassCardHeader>
          <GlassCardTitle level={1} className="text-center">Подтверждение email</GlassCardTitle>
          <p className="glass-text-secondary text-center mt-2">
            Мы отправили код подтверждения на {email}
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
                Отправить код повторно через {formatTime(timeLeft)}
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