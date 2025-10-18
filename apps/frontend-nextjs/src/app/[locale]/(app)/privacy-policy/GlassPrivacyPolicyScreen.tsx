'use client';

import React from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent 
} from '@/components/ui/glass';

export default function GlassPrivacyPolicyScreen() {
  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="text-3xl text-center">
              Политика конфиденциальности
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="glass-text-secondary text-center">
              Последнее обновление: 15 января 2024 года
            </p>
          </GlassCardContent>
        </GlassCard>

        {/* Content */}
        <GlassCard variant="elevated" padding="lg">
          <GlassCardContent>
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                1. Введение
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                MebelPlace ("мы", "наш", "нас") обязуется защищать конфиденциальность наших пользователей. 
                Данная Политика конфиденциальности объясняет, как мы собираем, используем, раскрываем и 
                защищаем информацию о вас при использовании нашего веб-сайта и услуг.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                2. Информация, которую мы собираем
              </h2>
              
              <h3 className="text-xl font-medium glass-text-primary mb-3">
                2.1 Персональная информация
              </h3>
              <p className="glass-text-secondary leading-relaxed mb-4">
                Мы можем собирать следующую персональную информацию:
              </p>
              <ul className="list-disc pl-6 glass-text-secondary mb-6 space-y-2">
                <li>Имя и фамилия</li>
                <li>Адрес электронной почты</li>
                <li>Номер телефона</li>
                <li>Адрес доставки и биллинга</li>
                <li>Информация о платежных методах</li>
                <li>Фотографии профиля</li>
                <li>Информация о профессиональном опыте</li>
              </ul>

              <h3 className="text-xl font-medium glass-text-primary mb-3">
                2.2 Информация об использовании
              </h3>
              <p className="glass-text-secondary leading-relaxed mb-4">
                Мы автоматически собираем информацию о том, как вы используете наш сервис:
              </p>
              <ul className="list-disc pl-6 glass-text-secondary mb-6 space-y-2">
                <li>IP-адрес и информация о местоположении</li>
                <li>Тип браузера и операционной системы</li>
                <li>Страницы, которые вы посещаете</li>
                <li>Время и дата ваших посещений</li>
                <li>История поиска и предпочтения</li>
              </ul>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                3. Как мы используем вашу информацию
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-4">
                Мы используем собранную информацию для:
              </p>
              <ul className="list-disc pl-6 glass-text-secondary mb-6 space-y-2">
                <li>Предоставления и улучшения наших услуг</li>
                <li>Обработки заказов и платежей</li>
                <li>Связи с вами по вопросам обслуживания</li>
                <li>Персонализации вашего опыта</li>
                <li>Предотвращения мошенничества</li>
                <li>Соблюдения правовых обязательств</li>
              </ul>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                4. Обмен информацией
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-4">
                Мы не продаем, не сдаем в аренду и не раскрываем вашу персональную информацию 
                третьим лицам, за исключением следующих случаев:
              </p>
              <ul className="list-disc pl-6 glass-text-secondary mb-6 space-y-2">
                <li>С вашего явного согласия</li>
                <li>Для выполнения заказа или предоставления услуги</li>
                <li>Для соблюдения правовых обязательств</li>
                <li>Для защиты наших прав и безопасности</li>
                <li>С доверенными поставщиками услуг</li>
              </ul>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                5. Безопасность данных
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Мы принимаем соответствующие технические и организационные меры для защиты 
                вашей персональной информации от несанкционированного доступа, изменения, 
                раскрытия или уничтожения. Это включает использование шифрования, 
                регулярные аудиты безопасности и ограничение доступа к данным.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                6. Ваши права
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-4">
                В соответствии с применимым законодательством, вы имеете право:
              </p>
              <ul className="list-disc pl-6 glass-text-secondary mb-6 space-y-2">
                <li>Получить доступ к вашей персональной информации</li>
                <li>Исправить неточную или неполную информацию</li>
                <li>Удалить вашу персональную информацию</li>
                <li>Ограничить обработку ваших данных</li>
                <li>Перенести ваши данные</li>
                <li>Возразить против обработки</li>
              </ul>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                7. Файлы cookie
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Мы используем файлы cookie и аналогичные технологии для улучшения функциональности 
                нашего сайта, анализа использования и персонализации контента. Вы можете управлять 
                настройками cookie через ваш браузер.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                8. Сторонние сервисы
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Наш сервис может содержать ссылки на сторонние веб-сайты или интегрировать 
                сторонние сервисы. Мы не несем ответственности за политику конфиденциальности 
                или практики этих третьих сторон.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                9. Изменения в политике
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Мы можем обновлять эту Политику конфиденциальности время от времени. 
                Мы уведомим вас о любых существенных изменениях, разместив новую 
                Политику конфиденциальности на этой странице.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                10. Контактная информация
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Если у вас есть вопросы относительно данной Политики конфиденциальности 
                или обработки ваших персональных данных, пожалуйста, свяжитесь с нами:
              </p>
              
              <div className="glass-bg-secondary rounded-lg p-4 mb-6">
                <p className="glass-text-primary font-medium mb-2">MebelPlace</p>
                <p className="glass-text-secondary">Email: privacy@mebelplace.kz</p>
                <p className="glass-text-secondary">Телефон: +7 777 123 45 67</p>
                <p className="glass-text-secondary">Адрес: Алматы, Казахстан</p>
              </div>

              <div className="text-center mt-8 pt-6 border-t border-white/10">
                <p className="glass-text-muted text-sm">
                  Эта Политика конфиденциальности является частью наших 
                  <a href="/terms" className="glass-text-accent-orange-500 hover:underline ml-1">
                    Условий использования
                  </a>
                </p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
