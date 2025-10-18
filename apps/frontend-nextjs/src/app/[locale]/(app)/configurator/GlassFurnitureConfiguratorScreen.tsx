'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton,
  GlassInput 
} from '@/components/ui/glass';

interface FurnitureItem {
  id: string;
  name: string;
  type: 'kitchen' | 'wardrobe' | 'table' | 'chair' | 'bed';
  basePrice: number;
  materials: {
    id: string;
    name: string;
    price: number;
    image: string;
  }[];
  colors: {
    id: string;
    name: string;
    hex: string;
    price: number;
  }[];
  accessories: {
    id: string;
    name: string;
    price: number;
    description: string;
  }[];
}

interface Configuration {
  furnitureType: string;
  selectedMaterial: string;
  selectedColor: string;
  selectedAccessories: string[];
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  totalPrice: number;
}

export default function GlassFurnitureConfiguratorScreen() {
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([]);
  const [config, setConfig] = useState<Configuration>({
    furnitureType: '',
    selectedMaterial: '',
    selectedColor: '',
    selectedAccessories: [],
    dimensions: {
      width: 200,
      height: 80,
      depth: 60
    
  // API hooks
  // const { data, loading, error, refetch } = use[RelevantHook]();
},
    totalPrice: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'materials' | 'colors' | 'accessories' | 'dimensions'>('materials');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchFurnitureItems = async () => {
      // Loading handled by API hooks
    };

    fetchFurnitureItems();
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [config]);

  const calculateTotalPrice = () => {
    const selectedItem = furnitureItems.find(item => item.id === config.furnitureType);
    if (!selectedItem) return;

    const selectedMaterial = selectedItem.materials.find(m => m.id === config.selectedMaterial);
    const selectedColor = selectedItem.colors.find(c => c.id === config.selectedColor);
    const selectedAccessories = selectedItem.accessories.filter(a => config.selectedAccessories.includes(a.id));

    const materialPrice = selectedMaterial?.price || 0;
    const colorPrice = selectedColor?.price || 0;
    const accessoriesPrice = selectedAccessories.reduce((sum, acc) => sum + acc.price, 0);
    
    // Size multiplier (base on volume)
    const volume = (config.dimensions.width * config.dimensions.height * config.dimensions.depth) / 1000000;
    const sizeMultiplier = Math.max(0.5, Math.min(2, volume / 1)); // Between 0.5x and 2x

    const totalPrice = (selectedItem.basePrice + materialPrice + colorPrice + accessoriesPrice) * sizeMultiplier;
    
    setConfig(prev => ({ ...prev, totalPrice }));
  };

  const selectedItem = furnitureItems.find(item => item.id === config.furnitureType);
  const selectedMaterial = selectedItem?.materials.find(m => m.id === config.selectedMaterial);
  const selectedColor = selectedItem?.colors.find(c => c.id === config.selectedColor);

  const handleAccessoryToggle = (accessoryId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedAccessories: prev.selectedAccessories.includes(accessoryId)
        ? prev.selectedAccessories.filter(id => id !== accessoryId)
        : [...prev.selectedAccessories, accessoryId]
    }));
  };

  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: number) => {
    setConfig(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: Math.max(10, Math.min(500, value)) // Min 10cm, max 500cm
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            <div className="h-96 glass-bg-secondary rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 glass-bg-secondary rounded" />
              <div className="h-32 glass-bg-secondary rounded" />
              <div className="h-8 glass-bg-secondary rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Конфигуратор мебели
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="glass-text-secondary">
              Создайте идеальную мебель по вашим параметрам
            </p>
          </GlassCardContent>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3D Preview */}
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                3D Предварительный просмотр
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="aspect-square glass-bg-secondary rounded-xl flex items-center justify-center mb-4">
                <div className="text-center">
                  <svg className="w-16 h-16 glass-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="glass-text-secondary">3D модель будет здесь</p>
                  <p className="text-sm glass-text-muted">Размеры: {config.dimensions.width}×{config.dimensions.height}×{config.dimensions.depth} см</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <GlassButton variant="secondary" size="sm">
                  Повернуть
                </GlassButton>
                <GlassButton variant="secondary" size="sm">
                  Приблизить
                </GlassButton>
                <GlassButton variant="secondary" size="sm">
                  Сброс
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Configuration Panel */}
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Настройка конфигурации
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              {/* Furniture Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium glass-text-primary mb-3">
                  Тип мебели
                </label>
                <select
                  value={config.furnitureType}
                  onChange={(e) => setConfig(prev => ({ ...prev, furnitureType: e.target.value }))}
                  className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {furnitureItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - от {item.basePrice.toLocaleString()} ₸
                    </option>
                  ))}
                </select>
              </div>

              {/* Configuration Tabs */}
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  {(['materials', 'colors', 'accessories', 'dimensions'] as const).map((tab) => (
                    <GlassButton
                      key={tab}
                      variant={activeTab === tab ? 'gradient' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === 'materials' && 'Материалы'}
                      {tab === 'colors' && 'Цвета'}
                      {tab === 'accessories' && 'Аксессуары'}
                      {tab === 'dimensions' && 'Размеры'}
                    </GlassButton>
                  ))}
                </div>

                {/* Materials Tab */}
                {activeTab === 'materials' && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedItem?.materials.map((material) => (
                      <button
                        key={material.id}
                        onClick={() => setConfig(prev => ({ ...prev, selectedMaterial: material.id }))}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          config.selectedMaterial === material.id
                            ? 'glass-bg-accent-orange-500 text-white border-orange-400'
                            : 'glass-bg-secondary glass-text-primary glass-border hover:glass-bg-primary'
                        }`}
                      >
                        <div className="font-medium mb-1">{material.name}</div>
                        <div className="text-sm opacity-80">
                          +{material.price.toLocaleString()} ₸
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Colors Tab */}
                {activeTab === 'colors' && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedItem?.colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setConfig(prev => ({ ...prev, selectedColor: color.id }))}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          config.selectedColor === color.id
                            ? 'ring-2 ring-orange-400'
                            : 'glass-bg-secondary glass-text-primary glass-border hover:glass-bg-primary'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div>
                            <div className="font-medium">{color.name}</div>
                            {color.price > 0 && (
                              <div className="text-sm opacity-80">
                                +{color.price.toLocaleString()} ₸
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Accessories Tab */}
                {activeTab === 'accessories' && (
                  <div className="space-y-3">
                    {selectedItem?.accessories.map((accessory) => (
                      <div
                        key={accessory.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          config.selectedAccessories.includes(accessory.id)
                            ? 'glass-bg-accent-blue-500 text-white border-blue-400'
                            : 'glass-bg-secondary glass-text-primary glass-border hover:glass-bg-primary'
                        }`}
                        onClick={() => handleAccessoryToggle(accessory.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{accessory.name}</div>
                            <div className="text-sm opacity-80">{accessory.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              +{accessory.price.toLocaleString()} ₸
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dimensions Tab */}
                {activeTab === 'dimensions' && (
                  <div className="space-y-4">
                    {(['width', 'height', 'depth'] as const).map((dimension) => (
                      <div key={dimension}>
                        <label className="block text-sm font-medium glass-text-primary mb-2">
                          {dimension === 'width' && 'Ширина'}
                          {dimension === 'height' && 'Высота'}
                          {dimension === 'depth' && 'Глубина'} (см)
                        </label>
                        <div className="flex items-center gap-3">
                          <GlassInput
                            type="number"
                            value={config.dimensions[dimension].toString()}
                            onValueChange={(value) => handleDimensionChange(dimension, parseInt(value) || 0)}
                            className="flex-1"
                          />
                          <div className="text-sm glass-text-secondary">
                            {config.dimensions[dimension]} см
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Price Summary and Actions */}
        <GlassCard variant="elevated" padding="lg" className="mt-6">
          <GlassCardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  Итоговая стоимость
                </h3>
                <div className="text-3xl font-bold glass-text-accent-orange-500">
                  {config.totalPrice.toLocaleString()} ₸
                </div>
                <div className="text-sm glass-text-secondary mt-1">
                  {selectedItem?.name} • {selectedMaterial?.name} • {selectedColor?.name}
                </div>
              </div>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="lg">
                  Сохранить проект
                </GlassButton>
                <GlassButton variant="gradient" size="lg">
                  Создать заказ
                </GlassButton>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
