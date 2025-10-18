'use client';

import React, { useState } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton,
  GlassInput 
} from '@/components/ui/glass';
import { useAuth } from '@/lib/api/hooks';

export default function GlassForgotPasswordScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement forgotPassword API call
      setSuccess(true);
    } catch (error) {
      setError('Произошла ошибка при отправке SMS');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
        <GlassCard variant="elevated" padding="xl" className="w-full max-w-md">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="text-center">SMS отправлено</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 glass-bg-success rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="glass-text-secondary">
                Мы отправили SMS с инструкциями по восстановлению пароля на номер {phone}
              </p>
              <GlassButton variant="gradient" size="lg" className="w-full" onClick={() => window.location.href = '/auth/login'}>
                Вернуться к входу
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
      <GlassCard variant="elevated" padding="xl" className="w-full max-w-md">
        <GlassCardHeader>
          <GlassCardTitle level={1} className="text-center">Восстановление пароля</GlassCardTitle>
          <p className="glass-text-secondary text-center mt-2">
            Введите номер телефона, на который мы отправим SMS с инструкциями
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
              label="Номер телефона"
              type="tel"
              value={phone}
              onValueChange={setPhone}
              placeholder="+7 777 123 45 67"
              required
              disabled={loading}
            />
            
            <GlassButton 
              type="submit" 
              variant="gradient" 
              size="lg" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить SMS'}
            </GlassButton>
          </form>
          
          <div className="mt-6 text-center">
            <div className="glass-text-muted">
              Вспомнили пароль? <a href="/auth/login" className="glass-text-accent-orange-500 hover:glass-text-accent-orange-400 transition-colors">Войти</a>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}