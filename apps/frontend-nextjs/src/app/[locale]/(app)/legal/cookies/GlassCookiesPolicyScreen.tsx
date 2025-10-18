'use client';

import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass';

export default function GlassCookiesPolicyScreen() {
  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        <GlassCard variant="elevated" padding="xl">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Политика использования файлов cookie</GlassCardTitle>
            <p className="glass-text-secondary">Последнее обновление: 15 января 2024 г.</p>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Что такое файлы cookie?</h2>
                <p className="glass-text-secondary leading-relaxed">
                  Файлы cookie — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении нашего веб-сайта. 
                  Они помогают нам улучшить работу сайта и предоставлять персонализированный опыт.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Типы файлов cookie</h2>
                <div className="space-y-4">
                  <div className="glass-bg-secondary p-4 rounded-lg">
                    <h3 className="font-semibold glass-text-primary mb-2">Необходимые cookie</h3>
                    <p className="glass-text-secondary text-sm">
                      Эти файлы cookie необходимы для функционирования сайта и не могут быть отключены.
                    </p>
                  </div>
                  <div className="glass-bg-secondary p-4 rounded-lg">
                    <h3 className="font-semibold glass-text-primary mb-2">Аналитические cookie</h3>
                    <p className="glass-text-secondary text-sm">
                      Помогают нам понимать, как посетители взаимодействуют с сайтом.
                    </p>
                  </div>
                  <div className="glass-bg-secondary p-4 rounded-lg">
                    <h3 className="font-semibold glass-text-primary mb-2">Функциональные cookie</h3>
                    <p className="glass-text-secondary text-sm">
                      Позволяют сайту запоминать ваши предпочтения и настройки.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Управление cookie</h2>
                <p className="glass-text-secondary leading-relaxed">
                  Вы можете управлять настройками cookie через настройки вашего браузера. 
                  Обратите внимание, что отключение некоторых cookie может повлиять на функциональность сайта.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold glass-text-primary mb-4">Контакты</h2>
                <p className="glass-text-secondary leading-relaxed">
                  Если у вас есть вопросы по поводу использования cookie, 
                  свяжитесь с нами по адресу: privacy@mebelplace.com.kz
                </p>
              </section>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
