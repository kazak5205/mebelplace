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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
}

export default function GlassSupportScreen() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets'>('faq');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [ticketForm, setTicketForm] = useState<SupportTicket>({
    id: '',
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
    status: 'open'
  
  // API hooks
  // const { data, loading, error, refetch } = use[RelevantHook]();
});
  const [submitting, setSubmitting] = useState(false);

  const faqCategories = [
    { id: 'all', label: 'Все вопросы' },
    { id: 'account', label: 'Аккаунт' },
    { id: 'orders', label: 'Заказы' },
    { id: 'payments', label: 'Платежи' },
    { id: 'technical', label: 'Техническая поддержка' },
    { id: 'general', label: 'Общие вопросы' }
  ];

  const faqData: FAQ[] = [
    {
      id: '1',
      question: 'Как создать заявку на изготовление мебели?',
      answer: 'Для создания заявки перейдите в раздел "Создать заявку", заполните все необходимые поля: описание проекта, бюджет, сроки, загрузите фотографии и выберите категорию. После создания заявки мастера смогут предложить свои услуги.',
      category: 'orders'
    },
    {
      id: '2',
      question: 'Как происходит оплата заказа?',
      answer: 'Оплата происходит через защищенную платежную систему. Вы можете оплатить картой, через мобильные платежи или банковским переводом. Средства блокируются на время выполнения заказа и переводятся мастеру после успешного завершения работы.',
      category: 'payments'
    },
    {
      id: '3',
      question: 'Могу ли я отменить заказ?',
      answer: 'Да, вы можете отменить заказ до начала работ без штрафов. После начала работ применяется политика частичного возврата в зависимости от объема выполненных работ. Подробные условия указаны в Условиях использования.',
      category: 'orders'
    },
    {
      id: '4',
      question: 'Как связаться с мастером?',
      answer: 'После выбора мастера для вашего заказа вы можете связаться с ним через встроенную систему сообщений в личном кабинете. Также доступна возможность аудио и видеозвонков для обсуждения деталей проекта.',
      category: 'general'
    },
    {
      id: '5',
      question: 'Как изменить пароль?',
      answer: 'Для изменения пароля перейдите в "Настройки" → "Безопасность" → "Изменить пароль". Введите текущий пароль и новый пароль дважды для подтверждения. Новый пароль должен содержать минимум 8 символов.',
      category: 'account'
    },
    {
      id: '6',
      question: 'Что делать, если не приходят уведомления?',
      answer: 'Проверьте настройки уведомлений в личном кабинете. Убедитесь, что уведомления включены для нужных действий. Также проверьте, что в браузере разрешены уведомления для нашего сайта.',
      category: 'technical'
    },
    {
      id: '7',
      question: 'Как стать мастером на платформе?',
      answer: 'Для регистрации в качестве мастера заполните расширенную анкету, загрузите портфолио работ и пройдите верификацию. После проверки документов и подтверждения опыта вы сможете принимать заказы.',
      category: 'account'
    },
    {
      id: '8',
      question: 'Какие гарантии предоставляет платформа?',
      answer: 'MebelPlace гарантирует безопасность транзакций, защиту персональных данных и помощь в разрешении споров. Мы также предоставляем страховку на случай невыполнения заказа мастером.',
      category: 'general'
    }
  ];

  const filteredFAQs = faqData.filter(faq => 
    selectedCategory === 'all' || faq.category === selectedCategory
  );

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // API integration - using mock data structure matching API types
      console.log('Submitting support ticket:', ticketForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Заявка в службу поддержки успешно отправлена! Мы свяжемся с вами в течение 24 часов.');
      
      // Reset form
      setTicketForm({
        id: '',
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium',
        status: 'open'
      });
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Ошибка при отправке заявки. Попробуйте еще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
              Служба поддержки
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="glass-text-secondary">
              Мы всегда готовы помочь! Найдите ответы на частые вопросы или свяжитесь с нашей командой поддержки.
            </p>
          </GlassCardContent>
        </GlassCard>

        {/* Navigation Tabs */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'faq', label: 'Часто задаваемые вопросы', icon: '❓' },
                { id: 'contact', label: 'Связаться с нами', icon: '💬' },
                { id: 'tickets', label: 'Мои заявки', icon: '🎫' }
              ].map((tab) => (
                <GlassButton
                  key={tab.id}
                  variant={activeTab === tab.id ? 'gradient' : 'ghost'}
                  size="md"
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <>
            {/* Category Filter */}
            <GlassCard variant="elevated" padding="lg" className="mb-6">
              <GlassCardContent>
                <div className="flex flex-wrap gap-2">
                  {faqCategories.map((category) => (
                    <GlassButton
                      key={category.id}
                      variant={selectedCategory === category.id ? 'gradient' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.label}
                    </GlassButton>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <GlassCard key={faq.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
                  <GlassCardContent>
                    <h3 className="text-lg font-semibold glass-text-primary mb-3">
                      {faq.question}
                    </h3>
                    <p className="glass-text-secondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </GlassCardContent>
                </GlassCard>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <GlassCard variant="elevated" padding="xl" className="text-center">
                <GlassCardContent>
                  <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold glass-text-primary mb-2">
                    Вопросы не найдены
                  </h3>
                  <p className="glass-text-secondary mb-4">
                    Попробуйте выбрать другую категорию или свяжитесь с нами напрямую
                  </p>
                  <GlassButton variant="gradient" onClick={() => setActiveTab('contact')}>
                    Связаться с нами
                  </GlassButton>
                </GlassCardContent>
              </GlassCard>
            )}
          </>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Form */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Отправить заявку
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <GlassInput
                    label="Тема обращения"
                    value={ticketForm.subject}
                    onValueChange={(value) => setTicketForm(prev => ({ ...prev, subject: value }))}
                    placeholder="Кратко опишите проблему"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium glass-text-primary mb-2">
                      Категория
                    </label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="general">Общие вопросы</option>
                      <option value="account">Проблемы с аккаунтом</option>
                      <option value="orders">Заказы и доставка</option>
                      <option value="payments">Платежи и возврат</option>
                      <option value="technical">Техническая поддержка</option>
                      <option value="business">Бизнес-вопросы</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium glass-text-primary mb-2">
                      Приоритет
                    </label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="low">Низкий</option>
                      <option value="medium">Средний</option>
                      <option value="high">Высокий</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium glass-text-primary mb-2">
                      Описание проблемы
                    </label>
                    <textarea
                      rows={5}
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Подробно опишите вашу проблему или вопрос..."
                      required
                    />
                  </div>

                  <GlassButton
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    loading={submitting}
                  >
                    {submitting ? 'Отправка...' : 'Отправить заявку'}
                  </GlassButton>
                </form>
              </GlassCardContent>
            </GlassCard>

            {/* Contact Information */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Другие способы связи
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 glass-bg-accent-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold glass-text-primary">Email</h3>
                      <p className="glass-text-secondary">support@mebelplace.kz</p>
                      <p className="text-sm glass-text-muted">Ответим в течение 24 часов</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 glass-bg-accent-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold glass-text-primary">Телефон</h3>
                      <p className="glass-text-secondary">+7 777 123 45 67</p>
                      <p className="text-sm glass-text-muted">Пн-Пт: 9:00-18:00 (Алматы)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 glass-bg-accent-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold glass-text-primary">Чат</h3>
                      <p className="glass-text-secondary">Онлайн поддержка</p>
                      <p className="text-sm glass-text-muted">Доступен 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 glass-bg-success rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold glass-text-primary">Офис</h3>
                      <p className="glass-text-secondary">Алматы, Казахстан</p>
                      <p className="text-sm glass-text-muted">ул. Абая 150, офис 301</p>
                    </div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                История заявок
              </h3>
              <p className="glass-text-secondary mb-4">
                Здесь будут отображаться все ваши обращения в службу поддержки. 
                Функция будет доступна после интеграции с API.
              </p>
              <GlassButton variant="gradient" onClick={() => setActiveTab('contact')}>
                Создать заявку
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
