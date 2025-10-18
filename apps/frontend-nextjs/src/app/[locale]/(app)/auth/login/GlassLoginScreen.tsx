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

interface LoginFormData {
  email_or_phone: string;
  password: string;
}

export default function GlassLoginScreen() {
  const [formData, setFormData] = useState<LoginFormData>({
    email_or_phone: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login(formData.email_or_phone, formData.password);
      
      if (response.success) {
        window.location.href = '/';
      } else {
        setError(response.error || 'Ошибка входа');
      }
    } catch (error) {
      setError('Произошла ошибка при входе');
    }
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
      <GlassCard variant="elevated" padding="xl" className="w-full max-w-md">
        <GlassCardHeader>
          <GlassCardTitle level={1} className="text-center">Вход в аккаунт</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {error && (
            <div className="glass-bg-danger glass-border rounded-lg p-3 mb-4">
              <p className="text-white text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <GlassInput
              label="Email или номер телефона"
              type="text"
              value={formData.email_or_phone}
              onValueChange={(value) => setFormData({...formData, email_or_phone: value})}
              placeholder="+7 777 123 45 67 или ivan@example.com"
              required
              disabled={loading}
            />
            
            <GlassInput
              label="Пароль"
              type="password"
              value={formData.password}
              onValueChange={(value) => setFormData({...formData, password: value})}
              placeholder="Введите пароль"
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
              {loading ? 'Вход...' : 'Войти'}
            </GlassButton>
          </form>
          
          <div className="mt-6 text-center space-y-3">
            <a href="/auth/forgot-password" className="glass-text-accent-blue-500 hover:glass-text-accent-blue-400 transition-colors">
              Забыли пароль?
            </a>
            <div className="glass-text-muted">
              Нет аккаунта? <a href="/auth/register" className="glass-text-accent-orange-500 hover:glass-text-accent-orange-400 transition-colors">Зарегистрироваться</a>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}