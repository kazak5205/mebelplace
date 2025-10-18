'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton, 
  GlassInput 
} from '@/components/ui/glass';
import { useUploadVideo } from '@/lib/api/hooks';

interface UploadForm {
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  isProduct: boolean;
  productPrice?: string;
  productDescription?: string;
  thumbnail?: File;
}

export default function GlassUploadVideoScreen() {
  const router = useRouter();
  const [form, setForm] = useState<UploadForm>({
    title: '',
    description: '',
    category: 'furniture',
    tags: [],
    isPublic: true,
    isProduct: false,
    productPrice: '',
    productDescription: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // API hooks
  const { uploadVideo, loading: uploading, error } = useUploadVideo();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('video/')) {
      setSelectedFile(file);
    } else {
      alert('Пожалуйста, выберите видео файл');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Пожалуйста, выберите видео файл');
      return;
    }

    if (!form.title.trim()) {
      alert('Пожалуйста, введите название видео');
      return;
    }

    try {
      const response = await uploadVideo(selectedFile, {
        title: form.title,
        description: form.description,
        // hashtags: form.tags,
        // is_product: form.isProduct,
        // product_price: form.productPrice ? parseFloat(form.productPrice) : undefined,
        // product_description: form.productDescription
      });
      
      if (response.success) {
        // Reset form after successful upload
        setForm({
          title: '',
          description: '',
          category: 'furniture',
          tags: [],
          isPublic: true,
          isProduct: false,
          productPrice: '',
          productDescription: ''
        });
        setSelectedFile(null);
        router.push('/my-videos');
      } else {
        alert(error || 'Ошибка загрузки видео. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка загрузки видео. Попробуйте еще раз.');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Загрузить видео
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="glass-text-secondary">
              Поделитесь своими работами с сообществом MebelPlace
            </p>
          </GlassCardContent>
        </GlassCard>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Видео файл
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive 
                      ? 'glass-border-accent-orange-500 glass-bg-accent-orange-500/10' 
                      : 'glass-border glass-bg-secondary/20'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 glass-bg-success rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold glass-text-primary mb-2">
                          {selectedFile.name}
                        </h3>
                        <p className="text-sm glass-text-secondary">
                          Размер: {formatFileSize(selectedFile.size)}
                        </p>
                        {uploading && (
                          <div className="mt-4">
                            <div className="w-full glass-bg-secondary rounded-full h-2">
                              <div 
                                className="glass-bg-accent-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-sm glass-text-secondary mt-2">
                              {uploadProgress}% загружено
                            </p>
                          </div>
                        )}
                      </div>
                      <GlassButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Выбрать другой файл
                      </GlassButton>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 glass-bg-accent-blue-500 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold glass-text-primary mb-2">
                          Перетащите видео сюда
                        </h3>
                        <p className="text-sm glass-text-secondary mb-4">
                          или нажмите для выбора файла
                        </p>
                        <GlassButton
                          type="button"
                          variant="secondary"
                          size="md"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Выбрать файл
                        </GlassButton>
                      </div>
                      <div className="text-xs glass-text-muted">
                        Поддерживаемые форматы: MP4, AVI, MOV, WMV<br />
                        Максимальный размер: 2 ГБ
                      </div>
                    </div>
                  )}
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Video Details */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Информация о видео
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  <GlassInput
                    name="title"
                    type="text"
                    label="Название видео *"
                    placeholder="Введите название"
                    value={form.title}
                    onValueChange={(value) => handleInputChange({ target: { name: 'title', value } } as any)}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium glass-text-primary mb-2">
                      Описание
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      placeholder="Расскажите о вашем видео..."
                      value={form.description}
                      onChange={handleInputChange}
                      className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium glass-text-primary mb-2">
                      Категория
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleInputChange}
                      className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="furniture">Мебель</option>
                      <option value="design">Дизайн</option>
                      <option value="tutorial">Обучение</option>
                      <option value="restoration">Реставрация</option>
                      <option value="tools">Инструменты</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>

                  <GlassInput
                    name="tags"
                    type="text"
                    label="Теги"
                    placeholder="стол, дерево, мастер-класс"
                    value={form.tags.join(', ')}
                    onValueChange={(value) => handleInputChange({ target: { name: 'tags', value } } as any)}
                  />

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={form.isPublic}
                      onChange={handleInputChange}
                      className="rounded glass-border mr-3"
                    />
                    <label className="text-sm glass-text-primary">
                      Сделать видео публичным
                    </label>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Submit Button */}
          <div className="mt-6 text-center">
            <GlassButton
              type="submit"
              variant="gradient"
              size="xl"
              loading={uploading}
              disabled={!selectedFile || !form.title.trim()}
              className="min-w-[200px]"
            >
              {uploading ? 'Загружается...' : 'Загрузить видео'}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
