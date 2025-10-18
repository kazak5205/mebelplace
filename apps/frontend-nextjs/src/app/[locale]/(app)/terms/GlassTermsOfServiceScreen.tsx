'use client';

import React from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent 
} from '@/components/ui/glass';

export default function GlassTermsOfServiceScreen() {
  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="text-3xl text-center">
              Условия использования
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
                1. Принятие условий
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Добро пожаловать на MebelPlace! Эти Условия использования ("Условия") регулируют 
                ваше использование нашего веб-сайта и мобильного приложения MebelPlace (совместно 
                именуемых "Сервис"). Используя наш Сервис, вы соглашаетесь соблюдать эти Условия.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                2. Описание сервиса
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                MebelPlace - это платформа, которая соединяет заказчиков мебели с мастерами и 
                производителями мебели. Мы предоставляем инструменты для создания заявок, 
                управления заказами, общения между пользователями и обработки платежей.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                3. Регистрация и учетная запись
              </h2>
              
              <h3 className="text-xl font-medium glass-text-primary mb-3">
                3.1 Требования к учетной записи
              </h3>
              <p className="glass-text-secondary leading-relaxed mb-4">
                Для использования определенных функций нашего Сервиса вам необходимо создать учетную запись. 
                Вы соглашаетесь:
              </p>
              <ul className="list-disc pl-6 glass-text-secondary mb-6 space-y-2">
                <li>Предоставлять точную, актуальную и полную информацию</li>
                <li>Поддерживать актуальность вашей информации</li>
                <li>Нести ответственность за безопасность вашего пароля</li>
                <li>Немедленно уведомлять нас о любом несанкционированном использовании</li>
                <li>Быть старше 18 лет или иметь согласие родителей</li>
              </ul>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                4. Использование сервиса
              </h2>
              
              <h3 className="text-xl font-medium glass-text-primary mb-3">
                4.1 Разрешенное использование
              </h3>
              <p className="glass-text-secondary leading-relaxed mb-4">
                Вы можете использовать наш Сервис только в законных целях и в соответствии с этими Условиями. 
                Вы соглашаетесь не:
              </p>
              <ul className="list-disc pl-6 glass-text-secondary mb-6 space-y-2">
                <li>Нарушать любые применимые законы или правила</li>
                <li>Передавать ложную или вводящую в заблуждение информацию</li>
                <li>Вмешиваться в работу Сервиса</li>
                <li>Пытаться получить несанкционированный доступ к системам</li>
                <li>Использовать автоматизированные средства для доступа к Сервису</li>
              </ul>

              <h3 className="text-xl font-medium glass-text-primary mb-3">
                4.2 Заказчики
              </h3>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Заказчики могут создавать заявки на изготовление мебели, общаться с мастерами, 
                размещать заказы и оставлять отзывы. Вы несете ответственность за точность 
                описания ваших требований и своевременную оплату.
              </p>

              <h3 className="text-xl font-medium glass-text-primary mb-3">
                4.3 Мастера и производители
              </h3>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Мастера и производители могут отвечать на заявки, создавать предложения, 
                общаться с заказчиками и выполнять заказы. Вы несете ответственность за 
                качество работ, соблюдение сроков и профессиональное поведение.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                5. Платежи и комиссии
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-4">
                MebelPlace взимает комиссию за транзакции между пользователями. 
                Размер комиссии составляет:
              </p>
              <ul className="list-disc pl-6 glass-text-secondary mb-6 space-y-2">
                <li>5% от стоимости заказа для заказчиков</li>
                <li>3% от стоимости заказа для мастеров</li>
                <li>Дополнительные платежные комиссии согласно тарифам провайдеров</li>
              </ul>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                6. Отмена и возврат
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Политика отмены и возврата зависит от стадии выполнения заказа. 
                Заказчик может отменить заказ до начала работ без штрафов. 
                После начала работ применяется политика частичного возврата. 
                Подробные условия доступны в разделе "Политика отмены".
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                7. Интеллектуальная собственность
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Все материалы, представленные на MebelPlace, включая дизайн, текст, 
                графику, логотипы и программное обеспечение, являются собственностью 
                MebelPlace или наших лицензиаров и защищены законами об авторском праве.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                8. Ограничение ответственности
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                MebelPlace предоставляет Сервис "как есть" и не гарантирует его 
                бесперебойную работу или отсутствие ошибок. Мы не несем ответственности 
                за любые прямые, косвенные, случайные или последующие убытки, возникающие 
                в результате использования Сервиса.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                9. Разрешение споров
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Любые споры между пользователями разрешаются через нашу систему 
                медиации. Если медиация не удается, споры разрешаются в арбитраже 
                или в судах Республики Казахстан в соответствии с казахстанским правом.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                10. Приостановка и прекращение
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Мы оставляем за собой право приостановить или прекратить ваш доступ 
                к Сервису в любое время, с уведомлением или без него, за нарушение 
                этих Условий или по любой другой причине.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                11. Изменения условий
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Мы можем изменять эти Условия в любое время. Мы уведомим вас о 
                существенных изменениях по электронной почте или через наш Сервис. 
                Продолжение использования Сервиса после изменений означает принятие 
                новых Условий.
              </p>

              <h2 className="text-2xl font-semibold glass-text-primary mb-4">
                12. Контактная информация
              </h2>
              <p className="glass-text-secondary leading-relaxed mb-6">
                Если у вас есть вопросы относительно этих Условий, пожалуйста, 
                свяжитесь с нами:
              </p>
              
              <div className="glass-bg-secondary rounded-lg p-4 mb-6">
                <p className="glass-text-primary font-medium mb-2">MebelPlace</p>
                <p className="glass-text-secondary">Email: support@mebelplace.kz</p>
                <p className="glass-text-secondary">Телефон: +7 777 123 45 67</p>
                <p className="glass-text-secondary">Адрес: Алматы, Казахстан</p>
              </div>

              <div className="text-center mt-8 pt-6 border-t border-white/10">
                <p className="glass-text-muted text-sm">
                  Эти Условия использования действуют с 15 января 2024 года
                </p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
