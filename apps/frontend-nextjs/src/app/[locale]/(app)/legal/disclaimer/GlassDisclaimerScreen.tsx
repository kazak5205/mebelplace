'use client';

import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass';

export default function GlassDisclaimerScreen() {
  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        <GlassCard variant="elevated" padding="xl">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Отказ от ответственности</GlassCardTitle>
            <p className="glass-text-secondary">Последнее обновление: 15 января 2024 г.</p>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Общие положения</h2>
                <p className="glass-text-secondary leading-relaxed">
                  Данный отказ от ответственности регулирует использование платформы MebelPlace. 
                  Используя наш сервис, вы соглашаетесь с условиями данного документа.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Ограничение ответственности</h2>
                <p className="glass-text-secondary leading-relaxed mb-4">
                  MebelPlace не несет ответственности за:
                </p>
                <ul className="space-y-2 glass-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="glass-text-accent-orange-500">•</span>
                    <span>Качество выполненных работ мастеров</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="glass-text-accent-orange-500">•</span>
                    <span>Задержки в выполнении заказов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="glass-text-accent-orange-500">•</span>
                    <span>Повреждение имущества в ходе работ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="glass-text-accent-orange-500">•</span>
                    <span>Конфликты между заказчиками и исполнителями</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Обязанности пользователей</h2>
                <p className="glass-text-secondary leading-relaxed mb-4">
                  Пользователи платформы обязаны:
                </p>
                <ul className="space-y-2 glass-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="glass-text-accent-orange-500">•</span>
                    <span>Предоставлять достоверную информацию</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="glass-text-accent-orange-500">•</span>
                    <span>Соблюдать условия использования</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="glass-text-accent-orange-500">•</span>
                    <span>Уважительно относиться к другим пользователям</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="glass-text-accent-orange-500">•</span>
                    <span>Оплачивать услуги согласно договоренностям</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Изменения в услугах</h2>
                <p className="glass-text-secondary leading-relaxed">
                  MebelPlace оставляет за собой право изменять, приостанавливать или прекращать 
                  предоставление услуг в любое время без предварительного уведомления. 
                  Мы не несем ответственности за такие изменения.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Контакты</h2>
                <p className="glass-text-secondary leading-relaxed">
                  По вопросам, связанным с данным отказом от ответственности, 
                  обращайтесь по адресу: legal@mebelplace.com.kz
                </p>
              </section>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
