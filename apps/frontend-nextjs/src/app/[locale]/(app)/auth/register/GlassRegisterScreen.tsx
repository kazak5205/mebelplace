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

interface RegisterFormData {
  email_or_phone: string;
  username?: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export default function GlassRegisterScreen() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email_or_phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [error, setError] = useState<string>('');
  
  const { register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Необходимо согласиться с условиями использования');
      return;
    }

    try {
      const response = await register({
        email_or_phone: formData.email_or_phone,
        password: formData.password,
        username: formData.username || undefined
      });
      
      if (response.success) {
        window.location.href = '/auth/verify-sms';
      } else {
        setError('Ошибка регистрации');
      }
    } catch (error) {
      setError('Произошла ошибка при регистрации');
    }
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
      <GlassCard variant="elevated" padding="xl" className="w-full max-w-md">
        <GlassCardHeader>
          <GlassCardTitle level={1} className="text-center">Регистрация</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {error && (
            <div className="glass-bg-danger glass-border rounded-lg p-3 mb-4">
              <p className="text-white text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
              label="Имя пользователя (необязательно)"
              type="text"
              value={formData.username}
              onValueChange={(value) => setFormData({...formData, username: value})}
              placeholder="ivan_master"
              disabled={loading}
            />
            
            <GlassInput
              label="Пароль"
              type="password"
              value={formData.password}
              onValueChange={(value) => setFormData({...formData, password: value})}
              placeholder="Минимум 8 символов"
              required
              disabled={loading}
            />
            
            <GlassInput
              label="Подтвердите пароль"
              type="password"
              value={formData.confirmPassword}
              onValueChange={(value) => setFormData({...formData, confirmPassword: value})}
              placeholder="Повторите пароль"
              required
              disabled={loading}
            />
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                className="glass-bg-primary glass-border rounded"
                required
                disabled={loading}
              />
              <label htmlFor="agreeToTerms" className="text-sm glass-text-secondary">
                Я согласен с <a href="/terms" className="glass-text-accent-blue-500 hover:glass-text-accent-blue-400">условиями использования</a> и <a href="/privacy-policy" className="glass-text-accent-blue-500 hover:glass-text-accent-blue-400">политикой конфиденциальности</a>
              </label>
            </div>
            
            <GlassButton 
              type="submit" 
              variant="gradient" 
              size="lg" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </GlassButton>
          </form>
          
          <div className="mt-6 text-center">
            <div className="glass-text-muted">
              Уже есть аккаунт? <a href="/auth/login" className="glass-text-accent-orange-500 hover:glass-text-accent-orange-400 transition-colors">Войти</a>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}