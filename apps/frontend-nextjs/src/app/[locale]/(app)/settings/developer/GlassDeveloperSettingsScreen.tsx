'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton, GlassInput } from '@/components/ui/glass';

export default function GlassDeveloperSettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [sandboxMode, setSandboxMode] = useState(true);

  const endpoints = [
    {name: 'Users API', url: '/api/v1/users', method: 'GET', description: 'Получение списка пользователей'},
    {name: 'Orders API', url: '/api/v1/orders', method: 'GET', description: 'Получение списка заказов'},
    {name: 'Create Order', url: '/api/v1/orders', method: 'POST', description: 'Создание нового заказа'},
    {name: 'Webhooks', url: '/api/v1/webhooks', method: 'POST', description: 'Настройка webhook\'ов'}
  ];

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Настройки разработчика</GlassCardTitle>
            <p className="glass-text-secondary">Управление API доступом и интеграциями</p>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              <div>
                <GlassInput 
                  label="API ключ" 
                  type="password" 
                  value={apiKey} 
                  onValueChange={setApiKey} 
                  placeholder="Введите ваш API ключ"
                />
                <p className="text-sm glass-text-muted mt-2">
                  Используется для аутентификации API запросов
                </p>
              </div>

              <div>
                <GlassInput 
                  label="Webhook URL" 
                  value={webhookUrl} 
                  onValueChange={setWebhookUrl} 
                  placeholder="https://your-domain.com/webhook"
                />
                <p className="text-sm glass-text-muted mt-2">
                  URL для получения уведомлений о событиях
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Режим песочницы</p>
                  <p className="text-sm glass-text-secondary">Тестирование API без влияния на продакшн данные</p>
                </div>
                <button onClick={() => setSandboxMode(!sandboxMode)} className={`w-12 h-6 rounded-full transition-colors ${sandboxMode ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${sandboxMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex gap-3">
                <GlassButton variant="gradient" size="lg">
                  Сохранить настройки
                </GlassButton>
                <GlassButton variant="secondary" size="lg">
                  Тестировать API
                </GlassButton>
                <GlassButton variant="ghost" size="lg">
                  Документация API
                </GlassButton>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Доступные API endpoints</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              {endpoints.map((endpoint, i) => (
                <div key={i} className="glass-bg-secondary p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold glass-text-primary">{endpoint.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      endpoint.method === 'GET' ? 'glass-bg-success text-white' : 'glass-bg-accent-orange-500 text-white'
                    }`}>
                      {endpoint.method}
                    </span>
                  </div>
                  <div className="font-mono text-sm glass-text-accent-blue-500 mb-2">
                    {endpoint.url}
                  </div>
                  <p className="text-sm glass-text-secondary">{endpoint.description}</p>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Примеры использования</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="glass-bg-secondary p-4 rounded-lg">
              <h4 className="font-semibold glass-text-primary mb-3">Получение списка заказов</h4>
              <pre className="glass-bg-primary p-4 rounded-lg text-sm overflow-x-auto">
                <code className="glass-text-secondary">
{`curl -X GET "https://api.mebelplace.com.kz/v1/orders" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                </code>
              </pre>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
