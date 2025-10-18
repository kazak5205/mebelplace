'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton,
  GlassInput 
} from '@/components/ui/glass';
import { useCreateProposal } from '@/lib/api/hooks';

interface Request {
  id: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  deadline: string;
  materials: string[];
  images: string[];
}

interface ProposalForm {
  price: number;
  timeline: string;
  description: string;
  materials: string[];
  portfolio: File[];
  message: string;
}

interface ProposalErrors {
  price?: string;
  timeline?: string;
  description?: string;
  materials?: string;
  message?: string;
}

interface GlassCreateProposalScreenProps {
  requestId: string;
}

export default function GlassCreateProposalScreen({ requestId }: GlassCreateProposalScreenProps) {
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [form, setForm] = useState<ProposalForm>({
    price: 0,
    timeline: '',
    description: '',
    materials: [],
    portfolio: [],
    message: ''
  });

  // API hooks
  const { createProposal, loading, error } = useCreateProposal();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ProposalErrors>({});

  const availableMaterials = [
    'Дуб натуральный',
    'Сосна',
    'Береза',
    'Орех',
    'Бук',
    'МДФ',
    'ЛДСП',
    'Металл',
    'Стекло',
    'Пластик',
    'Кожа',
    'Ткань'
  ];

  // Data is now loaded via API hooks

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setForm(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ProposalErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleMaterialToggle = (material: string) => {
    setForm(prev => ({
      ...prev,
      materials: prev.materials.includes(material)
        ? prev.materials.filter(m => m !== material)
        : [...prev.materials, material]
    }));
  };

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setForm(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, ...files]
    }));
  };

  const removePortfolioImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ProposalErrors = {};

    if (form.price <= 0) {
      newErrors.price = 'Укажите стоимость работ';
    }
    if (!form.timeline.trim()) {
      newErrors.timeline = 'Укажите срок выполнения';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Опишите план работ';
    }
    if (form.materials.length === 0) {
      newErrors.materials = 'Выберите материалы';
    }
    if (!form.message.trim()) {
      newErrors.message = 'Напишите сообщение заказчику';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await createProposal(requestId, {
        message: form.message,
        proposed_price: form.price,
        timeline_days: parseInt(form.timeline) || 0,
        description: form.description,
        materials: form.materials,
        portfolio_items: form.portfolio
      });
      
      if (response.success) {
        alert('Предложение успешно отправлено! Заказчик получит уведомление.');
        router.push(`/requests/${requestId}`);
      } else {
        alert('Ошибка при отправке предложения: ' + (response.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Ошибка при отправке предложения');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            <div className="h-64 glass-bg-secondary rounded" />
            <div className="h-96 glass-bg-secondary rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
        <GlassCard variant="elevated" padding="xl" className="text-center max-w-md">
          <GlassCardContent>
            <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold glass-text-primary mb-2">
              Заявка не найдена
            </h3>
            <p className="glass-text-secondary mb-4">
              Возможно, заявка была удалена или ссылка неверна
            </p>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Создать предложение
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="glass-text-secondary">
              Отправьте свое предложение по заявке заказчика
            </p>
          </GlassCardContent>
        </GlassCard>

        {/* Request Info */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-lg">
              Информация о заявке
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold glass-text-primary mb-2">{request.title}</h3>
                <p className="glass-text-secondary leading-relaxed">{request.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm glass-text-secondary">Бюджет:</span>
                  <p className="font-semibold glass-text-primary">{request.budget.toLocaleString()} ₸</p>
                </div>
                <div>
                  <span className="text-sm glass-text-secondary">Срок:</span>
                  <p className="font-semibold glass-text-primary">
                    {new Date(request.deadline).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div>
                  <span className="text-sm glass-text-secondary">Местоположение:</span>
                  <p className="font-semibold glass-text-primary">{request.location}</p>
                </div>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Proposal Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Основная информация
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <GlassInput
                        name="price"
                        type="number"
                        label="Ваша цена (₸) *"
                        placeholder="450000"
                        value={form.price.toString()}
                        onValueChange={(value) => handleInputChange({ target: { name: 'price', value } } as any)}
                        error={errors.price}
                        required
                      />

                      <GlassInput
                        name="timeline"
                        type="text"
                        label="Срок выполнения *"
                        placeholder="2-3 недели"
                        value={form.timeline}
                        onValueChange={(value) => handleInputChange({ target: { name: 'timeline', value } } as any)}
                        error={errors.timeline}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium glass-text-primary mb-2">
                        Описание работ *
                      </label>
                      <textarea
                        name="description"
                        rows={4}
                        placeholder="Подробно опишите, как вы планируете выполнить заказ..."
                        value={form.description}
                        onChange={handleInputChange}
                        className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                      {errors.description && (
                        <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium glass-text-primary mb-2">
                        Сообщение заказчику *
                      </label>
                      <textarea
                        name="message"
                        rows={3}
                        placeholder="Напишите приветственное сообщение заказчику..."
                        value={form.message}
                        onChange={handleInputChange}
                        className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                      {errors.message && (
                        <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                      )}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              {/* Materials */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Материалы
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableMaterials.map((material) => (
                      <button
                        key={material}
                        type="button"
                        onClick={() => handleMaterialToggle(material)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          form.materials.includes(material)
                            ? 'glass-bg-accent-orange-500 text-white border-orange-400'
                            : 'glass-bg-secondary glass-text-primary glass-border hover:glass-bg-primary'
                        }`}
                      >
                        {material}
                      </button>
                    ))}
                  </div>
                  {errors.materials && (
                    <p className="text-red-400 text-sm mt-2">{errors.materials}</p>
                  )}
                </GlassCardContent>
              </GlassCard>

              {/* Portfolio */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Портфолио
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePortfolioUpload}
                      className="hidden"
                      id="portfolio-upload"
                    />
                    <label
                      htmlFor="portfolio-upload"
                      className="block w-full glass-bg-secondary glass-border border-dashed rounded-lg p-6 text-center cursor-pointer hover:glass-bg-primary transition-colors"
                    >
                      <svg className="w-12 h-12 mx-auto mb-4 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="glass-text-secondary">
                        Добавить фотографии ваших работ
                      </span>
                    </label>

                    {form.portfolio.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {form.portfolio.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removePortfolioImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 glass-bg-danger text-white rounded-full flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Comparison */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Сравнение цен
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Бюджет заказчика:</span>
                      <span className="glass-text-primary font-semibold">
                        {request.budget.toLocaleString()} ₸
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Ваша цена:</span>
                      <span className="glass-text-accent-orange-500 font-semibold">
                        {form.price.toLocaleString()} ₸
                      </span>
                    </div>
                    
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between">
                        <span className="glass-text-secondary">Разница:</span>
                        <span className={`font-semibold ${
                          form.price <= request.budget 
                            ? 'glass-text-success' 
                            : 'glass-text-danger'
                        }`}>
                          {Math.abs(form.price - request.budget).toLocaleString()} ₸
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              {/* Tips */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Советы
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-3 text-sm glass-text-secondary">
                    <p>• Укажите реалистичный срок выполнения</p>
                    <p>• Приложите фото похожих работ</p>
                    <p>• Будьте вежливы в сообщении</p>
                    <p>• Укажите все материалы</p>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <GlassButton
              type="submit"
              variant="gradient"
              size="xl"
              loading={submitting}
              className="min-w-[200px]"
            >
              {submitting ? 'Отправка...' : 'Отправить предложение'}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
