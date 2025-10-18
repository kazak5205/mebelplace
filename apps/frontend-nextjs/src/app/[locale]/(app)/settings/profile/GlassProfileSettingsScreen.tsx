'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton, GlassInput } from '@/components/ui/glass';

export default function GlassProfileSettingsScreen() {
  const [formData, setFormData] = useState({
    firstName: 'Иван',
    lastName: 'Иванов',
    email: 'ivan@example.com',
    phone: '+7 777 123 45 67',
    bio: 'Мастер столярного дела',
    location: 'Алматы',
    website: 'https://example.com'
  });

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        <GlassCard variant="elevated" padding="xl">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Настройки профиля</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassInput label="Имя" value={formData.firstName} onValueChange={(value) => setFormData({...formData, firstName: value})} />
                <GlassInput label="Фамилия" value={formData.lastName} onValueChange={(value) => setFormData({...formData, lastName: value})} />
              </div>
              <GlassInput label="Email" type="email" value={formData.email} onValueChange={(value) => setFormData({...formData, email: value})} />
              <GlassInput label="Телефон" value={formData.phone} onValueChange={(value) => setFormData({...formData, phone: value})} />
              <div>
                <label className="block text-sm font-medium glass-text-primary mb-2">О себе</label>
                <textarea className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white" rows={4} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
              </div>
              <GlassButton variant="gradient" size="lg" className="w-full">Сохранить изменения</GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
