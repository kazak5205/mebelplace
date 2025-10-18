'use client';

import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass';

export default function GlassRefundPolicyScreen() {
  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        <GlassCard variant="elevated" padding="xl">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Политика возврата средств</GlassCardTitle>
            <p className="glass-text-secondary">Последнее обновление: 15 января 2024 г.</p>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Условия возврата</h2>
                <p className="glass-text-secondary leading-relaxed mb-4">
                  Мы стремимся обеспечить высокое качество услуг и удовлетворенность клиентов. 
                  Возврат средств возможен в следующих случаях:
                </p>
                <ul className="space-y-2 glass-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="glass-text-accent-orange-500">•</span>
                    <span>Отмена заказа в течение 24 часов после оплаты</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="glass-text-accent-orange-500">•</span>
                    <span>Невыполнение заказа мастером в установленные сроки</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="glass-text-accent-orange-500">•</span>
                    <span>Существенные отклонения от согласованных условий</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Процедура возврата</h2>
                <div className="space-y-3">
                  <div className="glass-bg-secondary p-4 rounded-lg">
                    <h3 className="font-semibold glass-text-primary mb-2">1. Подача заявки</h3>
                    <p className="glass-text-secondary text-sm">
                      Обратитесь в службу поддержки с описанием причины возврата
                    </p>
                  </div>
                  <div className="glass-bg-secondary p-4 rounded-lg">
                    <h3 className="font-semibold glass-text-primary mb-2">2. Рассмотрение</h3>
                    <p className="glass-text-secondary text-sm">
                      Мы рассмотрим вашу заявку в течение 3 рабочих дней
                    </p>
                  </div>
                  <div className="glass-bg-secondary p-4 rounded-lg">
                    <h3 className="font-semibold glass-text-primary mb-2">3. Возврат средств</h3>
                    <p className="glass-text-secondary text-sm">
                      При одобрении средства будут возвращены в течение 5-10 рабочих дней
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Комиссии</h2>
                <p className="glass-text-secondary leading-relaxed">
                  При возврате средств с нас может быть удержана комиссия платежной системы 
                  в размере 2-3% от суммы возврата, в зависимости от способа оплаты.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Контакты</h2>
                <p className="glass-text-secondary leading-relaxed">
                  Для подачи заявки на возврат средств обращайтесь:
                </p>
                <div className="mt-4 space-y-2">
                  <p className="glass-text-secondary">Email: refunds@mebelplace.com.kz</p>
                  <p className="glass-text-secondary">Телефон: +7 777 123 45 67</p>
                </div>
              </section>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
