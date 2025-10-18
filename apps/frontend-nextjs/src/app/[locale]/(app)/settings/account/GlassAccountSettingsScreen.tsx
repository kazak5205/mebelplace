'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton, GlassInput } from '@/components/ui/glass';

export default function GlassAccountSettingsScreen() {
  const [formData, setFormData] = useState({
    email: 'user@example.com',
    phone: '+7 777 123 45 67',
    language: 'ru',
    timezone: 'Asia/Almaty',
    currency: 'KZT'
  });

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Настройки аккаунта</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              <GlassInput label="Email" type="email" value={formData.email} onValueChange={(value) => setFormData({...formData, email: value})} />
              <GlassInput label="Телефон" value={formData.phone} onValueChange={(value) => setFormData({...formData, phone: value})} />
              
              <div>
                <label className="block text-sm font-medium glass-text-primary mb-2">Язык</label>
                <select value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})} className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white">
                  <option value="ru">Русский</option>
                  <option value="kk">Қазақша</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium glass-text-primary mb-2">Часовой пояс</label>
                <select value={formData.timezone} onChange={(e) => setFormData({...formData, timezone: e.target.value})} className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white">
                  <option value="Asia/Almaty">Алматы (UTC+6)</option>
                  <option value="Asia/Aqtobe">Актобе (UTC+5)</option>
                  <option value="Asia/Atyrau">Атырау (UTC+5)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium glass-text-primary mb-2">Валюта</label>
                <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white">
                  <option value="KZT">Тенге (₸)</option>
                  <option value="USD">Доллар ($)</option>
                  <option value="EUR">Евро (€)</option>
                </select>
              </div>

              <GlassButton variant="gradient" size="lg" className="w-full">Сохранить изменения</GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
