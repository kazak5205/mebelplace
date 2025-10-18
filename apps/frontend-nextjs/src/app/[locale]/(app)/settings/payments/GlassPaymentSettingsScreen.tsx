'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassPaymentSettingsScreen() {
  const [settings, setSettings] = useState({
    autoWithdraw: false,
    withdrawalLimit: 100000,
    commissionRate: 5,
    taxIncluded: true
  });

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Настройки платежей</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Автовывод средств</p>
                  <p className="text-sm glass-text-secondary">Автоматически выводить заработанные средства</p>
                </div>
                <button onClick={() => setSettings({...settings, autoWithdraw: !settings.autoWithdraw})} className={`w-12 h-6 rounded-full transition-colors ${settings.autoWithdraw ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.autoWithdraw ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium glass-text-primary mb-2">Лимит вывода</label>
                <input type="number" value={settings.withdrawalLimit} onChange={(e) => setSettings({...settings, withdrawalLimit: Number(e.target.value)})} className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium glass-text-primary mb-2">Комиссия платформы (%)</label>
                <input type="number" value={settings.commissionRate} onChange={(e) => setSettings({...settings, commissionRate: Number(e.target.value)})} className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">НДС включен в цену</p>
                  <p className="text-sm glass-text-secondary">Учитывать НДС при расчете комиссии</p>
                </div>
                <button onClick={() => setSettings({...settings, taxIncluded: !settings.taxIncluded})} className={`w-12 h-6 rounded-full transition-colors ${settings.taxIncluded ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.taxIncluded ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <GlassButton variant="gradient" size="lg" className="w-full">Сохранить настройки</GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
