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

export default function GlassContactScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  
  // API hooks
  // const { data, loading, error, refetch } = use[RelevantHook]();
});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // API integration will be implemented when backend is ready
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Сообщение отправлено успешно!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      alert('Произошла ошибка при отправке сообщения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="xl" className="mb-8 text-center">
          <GlassCardContent>
            <h1 className="text-4xl md:text-6xl font-bold glass-text-primary mb-6">
              Свяжитесь с <span className="glass-text-accent-orange-500">нами</span>
            </h1>
            <p className="text-xl glass-text-secondary leading-relaxed max-w-3xl mx-auto">
              У вас есть вопросы или предложения? Мы всегда рады помочь и готовы ответить на любые ваши вопросы.
            </p>
          </GlassCardContent>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <GlassCard variant="elevated" padding="xl">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-2xl mb-6">
                Отправить сообщение
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassInput
                    name="name"
                    label="Имя"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onValueChange={(value) => handleInputChange({ target: { name: 'name', value } } as any)}
                    required
                    className="w-full"
                  />
                  <GlassInput
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onValueChange={(value) => handleInputChange({ target: { name: 'email', value } } as any)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassInput
                    name="phone"
                    type="tel"
                    label="Телефон"
                    placeholder="+7 777 123 45 67"
                    value={formData.phone}
                    onValueChange={(value) => handleInputChange({ target: { name: 'phone', value } } as any)}
                    className="w-full"
                  />
                  <div>
                    <label className="block text-sm font-medium glass-text-primary mb-2">
                      Тип обращения
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="general">Общий вопрос</option>
                      <option value="support">Техническая поддержка</option>
                      <option value="partnership">Партнерство</option>
                      <option value="feedback">Отзыв</option>
                      <option value="complaint">Жалоба</option>
                    </select>
                  </div>
                </div>

                  <GlassInput
                    name="subject"
                    label="Тема"
                    placeholder="Краткое описание вопроса"
                    value={formData.subject}
                    onValueChange={(value) => handleInputChange({ target: { name: 'subject', value } } as any)}
                    required
                    className="w-full"
                  />

                <div>
                  <label className="block text-sm font-medium glass-text-primary mb-2">
                    Сообщение
                  </label>
                  <textarea
                    name="message"
                    rows={6}
                    placeholder="Подробно опишите ваш вопрос или предложение..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <GlassButton 
                  type="submit" 
                  variant="gradient" 
                  size="xl" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Отправляем...' : 'Отправить сообщение'}
                </GlassButton>
              </form>
            </GlassCardContent>
          </GlassCard>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Office Info */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={3} className="text-lg">
                  Офис
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 glass-bg-accent-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold glass-text-primary">Адрес</div>
                      <div className="glass-text-secondary">
                        г. Алматы, ул. Абая 150, офис 25<br />
                        БЦ "Абай Тауэр", 15 этаж
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 glass-bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold glass-text-primary">Телефон</div>
                      <div className="glass-text-secondary">
                        +7 777 123 45 67<br />
                        +7 727 123 45 67
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 glass-bg-accent-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold glass-text-primary">Email</div>
                      <div className="glass-text-secondary">
                        info@mebelplace.com.kz<br />
                        support@mebelplace.com.kz
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 glass-bg-accent-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold glass-text-primary">Время работы</div>
                      <div className="glass-text-secondary">
                        Пн-Пт: 9:00 - 18:00<br />
                        Сб: 10:00 - 16:00<br />
                        Вс: выходной
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Social Media */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={3} className="text-lg">
                  Социальные сети
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="grid grid-cols-2 gap-4">
                  <a href="https://instagram.com/mebelplace" className="flex items-center gap-3 p-3 glass-bg-secondary rounded-lg hover:glass-shadow-md transition-all">
                    <div className="w-10 h-10 glass-bg-accent-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium glass-text-primary">Instagram</div>
                      <div className="text-sm glass-text-secondary">@mebelplace</div>
                    </div>
                  </a>

                  <a href="https://facebook.com/mebelplace" className="flex items-center gap-3 p-3 glass-bg-secondary rounded-lg hover:glass-shadow-md transition-all">
                    <div className="w-10 h-10 glass-bg-accent-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium glass-text-primary">Facebook</div>
                      <div className="text-sm glass-text-secondary">MebelPlace</div>
                    </div>
                  </a>

                  <a href="https://t.me/mebelplace" className="flex items-center gap-3 p-3 glass-bg-secondary rounded-lg hover:glass-shadow-md transition-all">
                    <div className="w-10 h-10 glass-bg-success rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium glass-text-primary">Telegram</div>
                      <div className="text-sm glass-text-secondary">@mebelplace</div>
                    </div>
                  </a>

                  <a href="https://wa.me/77771234567" className="flex items-center gap-3 p-3 glass-bg-secondary rounded-lg hover:glass-shadow-md transition-all">
                    <div className="w-10 h-10 glass-bg-success rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium glass-text-primary">WhatsApp</div>
                      <div className="text-sm glass-text-secondary">+7 777 123 45 67</div>
                    </div>
                  </a>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Map */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={3} className="text-lg">
                  Как нас найти
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="aspect-video glass-bg-secondary rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 glass-text-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="glass-text-secondary">Карта будет загружена здесь</div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
