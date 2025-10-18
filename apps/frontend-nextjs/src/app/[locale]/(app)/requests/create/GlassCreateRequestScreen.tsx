'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton, 
  GlassInput 
} from '@/components/ui/glass';
import { useCreateRequest, useFileUpload } from '@/lib/api/hooks';

interface RequestForm {
  title: string;
  description: string;
  category: string;
  budget: string;
  region: string;
  location: string;
  deadline: string;
  images: File[];
  requirements: string;
  materials: string[];
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
}

export default function GlassCreateRequestScreen() {
  const router = useRouter();
  const { createRequest, loading, error } = useCreateRequest();
  const { uploadFile, uploading } = useFileUpload();
  const [form, setForm] = useState<RequestForm>({
    title: '',
    description: '',
    category: '',
    budget: '',
    region: '',
    location: '',
    deadline: '',
    images: [],
    requirements: '',
    materials: [],
    dimensions: {
      length: '',
      width: '',
      height: ''
    }
  });
  const [errors, setErrors] = useState<Partial<RequestForm>>({});
  
  // API hooks
  const { createRequest: createRequestAPI, loading: requestLoading, error: requestError } = useCreateRequest();

  const categories = [
    'Кухонная мебель',
    'Спальня',
    'Гостиная',
    'Детская мебель',
    'Офисная мебель',
    'Ванная комната',
    'Прихожая',
    'Реставрация',
    'Другое'
  ];

  const materials = [
    'Дуб',
    'Сосна',
    'Береза',
    'Орех',
    'Бук',
    'МДФ',
    'ЛДСП',
    'Металл',
    'Стекло',
    'Другое'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimension = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimension]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof RequestForm]) {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RequestForm> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Введите название заявки';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Введите описание';
    }
    if (!form.category) {
      newErrors.category = 'Выберите категорию';
    }
    if (!form.budget.trim()) {
      newErrors.budget = 'Укажите бюджет';
    }
    if (!form.region.trim()) {
      newErrors.region = 'Укажите регион';
    }
    if (!form.deadline) {
      newErrors.deadline = 'Укажите срок выполнения';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Upload images first
      const photoUrls: string[] = [];
      for (const file of form.images) {
        const url = await uploadFile(file);
        if (url) {
          photoUrls.push(url);
        }
      }

      const response = await createRequestAPI({
        title: form.title,
        description: form.description,
        category: form.category,
        budget: parseFloat(form.budget),
        region: form.region,
        photos: photoUrls
      });
      
      if (response.success) {
        router.push('/requests');
      } else {
        setErrors({ title: error || 'Ошибка создания заявки' });
      }
    } catch (error) {
      console.error('Error creating request:', error);
      setErrors({ title: 'Произошла ошибка при создании заявки' });
    }
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Создать заявку
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="glass-text-secondary">
              Опишите ваш проект и найдите подходящего мастера
            </p>
          </GlassCardContent>
        </GlassCard>

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
                    <GlassInput
                      name="title"
                      type="text"
                      label="Название заявки *"
                      placeholder="Например: Изготовление кухонного гарнитура"
                      value={form.title}
                      onValueChange={(value) => handleInputChange({ target: { name: 'title', value } } as any)}
                      error={errors.title}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium glass-text-primary mb-2">
                        Описание проекта *
                      </label>
                      <textarea
                        name="description"
                        rows={4}
                        placeholder="Подробно опишите, что именно вам нужно..."
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
                        Категория *
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleInputChange}
                        className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      >
                        <option value="">Выберите категорию</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-400 text-sm mt-1">{errors.category}</p>
                      )}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              {/* Dimensions */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Размеры
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <GlassInput
                      name="dimensions.length"
                      type="number"
                      label="Длина (см)"
                      placeholder="200"
                      value={form.dimensions.length}
                      onValueChange={(value) => handleInputChange({ target: { name: 'dimensions.length', value } } as any)}
                    />
                    <GlassInput
                      name="dimensions.width"
                      type="number"
                      label="Ширина (см)"
                      placeholder="60"
                      value={form.dimensions.width}
                      onValueChange={(value) => handleInputChange({ target: { name: 'dimensions.width', value } } as any)}
                    />
                    <GlassInput
                      name="dimensions.height"
                      type="number"
                      label="Высота (см)"
                      placeholder="80"
                      value={form.dimensions.height}
                      onValueChange={(value) => handleInputChange({ target: { name: 'dimensions.height', value } } as any)}
                    />
                  </div>
                </GlassCardContent>
              </GlassCard>

              {/* Materials */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Предпочтительные материалы
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {materials.map((material) => (
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
                </GlassCardContent>
              </GlassCard>

              {/* Requirements */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Дополнительные требования
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <textarea
                    name="requirements"
                    rows={3}
                    placeholder="Любые особые требования, предпочтения по стилю, цвету и т.д."
                    value={form.requirements}
                    onChange={handleInputChange}
                    className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </GlassCardContent>
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Budget & Timeline */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Бюджет и сроки
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <GlassInput
                      name="budget"
                      type="number"
                      label="Бюджет (₸) *"
                      placeholder="500000"
                      value={form.budget}
                      onValueChange={(value) => handleInputChange({ target: { name: 'budget', value } } as any)}
                      error={errors.budget}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium glass-text-primary mb-2">
                        Срок выполнения *
                      </label>
                      <input
                        name="deadline"
                        type="date"
                        value={form.deadline}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                      {errors.deadline && (
                        <p className="text-red-400 text-sm mt-1">{errors.deadline}</p>
                      )}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              {/* Location */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Местоположение
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <GlassInput
                    name="location"
                    type="text"
                    label="Город *"
                    placeholder="Алматы"
                    value={form.location}
                    onValueChange={(value) => handleInputChange({ target: { name: 'location', value } } as any)}
                    error={errors.location}
                    required
                  />
                </GlassCardContent>
              </GlassCard>

              {/* Images */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Фотографии
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="block w-full glass-bg-secondary glass-border border-dashed rounded-lg p-4 text-center cursor-pointer hover:glass-bg-primary transition-colors"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-sm glass-text-secondary">
                        Добавить фотографии
                      </span>
                    </label>

                    {form.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {form.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
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
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <GlassButton
              type="submit"
              variant="gradient"
              size="xl"
              loading={requestLoading || uploading}
              className="min-w-[200px]"
            >
              {requestLoading || uploading ? (uploading ? 'Загружаем файлы...' : 'Создаем заявку...') : 'Создать заявку'}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
