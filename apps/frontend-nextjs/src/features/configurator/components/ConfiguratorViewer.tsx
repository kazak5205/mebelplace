/**
 * ConfiguratorViewer - 3D furniture configurator
 * Per TZ: Material selector, dimensions control, color picker
 * Premium glassmorphism design
 */

'use client'

import { useState } from 'react'
import { X, Palette, Ruler, Package, RotateCw, Sun, ShoppingCart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui'

interface Material {
  id: string
  name: string
  price: number
  texture: string
  preview: string
}

interface ConfiguratorViewerProps {
  productId: string
  productName: string
  basePrice: number
  onClose: () => void
  onOrder?: (config: any) => void
}

export function ConfiguratorViewer({
  productId,
  productName,
  basePrice,
  onClose,
  onOrder,
}: ConfiguratorViewerProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('oak')
  const [selectedColor, setSelectedColor] = useState('#8B4513')
  const [dimensions, setDimensions] = useState({ width: 200, height: 80, depth: 60 })
  const [totalPrice, setTotalPrice] = useState(basePrice)

  const materials: Material[] = [
    { id: 'oak', name: 'Дуб', price: 0, texture: 'wood-oak', preview: '🟤' },
    { id: 'pine', name: 'Сосна', price: -5000, texture: 'wood-pine', preview: '🟡' },
    { id: 'walnut', name: 'Орех', price: 10000, texture: 'wood-walnut', preview: '🟫' },
    { id: 'marble', name: 'Мраморная столешница', price: 25000, texture: 'marble', preview: '⚪' },
    { id: 'metal', name: 'Металл', price: 15000, texture: 'metal', preview: '⚫' },
  ]

  const handleMaterialChange = (materialId: string) => {
    setSelectedMaterial(materialId)
    const material = materials.find(m => m.id === materialId)
    if (material) {
      setTotalPrice(basePrice + material.price)
    }
  }

  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: number) => {
    setDimensions(prev => ({ ...prev, [dimension]: value }))
    // Recalculate price based on size
    const sizeMultiplier = (value / 100) * 0.1
    setTotalPrice(prev => Math.round(prev * (1 + sizeMultiplier)))
  }

  const handleOrder = () => {
    const configuration = {
      productId,
      material: selectedMaterial,
      color: selectedColor,
      dimensions,
      totalPrice,
    }
    onOrder?.(configuration)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 3D Viewer Area */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* 3D Model placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Main 3D object */}
            <div 
              className="w-96 h-96 rounded-3xl flex items-center justify-center transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${selectedColor}50, ${selectedColor}80)`,
                backdropFilter: 'blur(20px)',
                transform: 'rotateX(20deg) rotateY(20deg)',
              }}
            >
              <span className="text-9xl">🪑</span>
            </div>

            {/* Dimension indicators */}
            <div className="absolute -top-8 left-0 right-0 flex justify-center">
              <div className="glass-card">
                <p className="text-white text-sm font-mono">{dimensions.width} см</p>
              </div>
            </div>

            <div className="absolute -right-12 top-1/2 -translate-y-1/2">
              <div className="glass-card">
                <p className="text-white text-sm font-mono">{dimensions.depth} см</p>
              </div>
            </div>

            <div className="absolute -left-12 top-1/2 -translate-y-1/2">
              <div className="glass-card">
                <p className="text-white text-sm font-mono">{dimensions.height} см</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lighting control */}
        <div className="absolute top-4 right-4">
          <button className="p-3 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all">
            <Sun className="w-6 h-6 text-yellow-400" />
          </button>
        </div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-4 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="glass-card">
            <div>
              <h2 className="text-white font-bold text-lg">{productName}</h2>
              <p className="text-white/70 text-sm">Конфигуратор 3D</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-3 bg-black/50 backdrop-blur-xl rounded-full hover:bg-black/70 transition-all"
            aria-label="Закрыть"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Configuration Panel */}
      <div className="absolute bottom-0 inset-x-0 p-4 safe-area-bottom max-h-[60vh] overflow-y-auto">
        <div className="space-y-3">
          {/* Material Selector */}
          <div className="glass-card">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-semibold">Материал</h3>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {materials.map(material => (
                  <button
                    key={material.id}
                    onClick={() => handleMaterialChange(material.id)}
                    className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      selectedMaterial === material.id
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50 scale-105'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-2xl">{material.preview}</span>
                    <span className="text-xs font-medium whitespace-nowrap">{material.name}</span>
                    {material.price !== 0 && (
                      <span className="text-xs">
                        {material.price > 0 ? '+' : ''}{material.price.toLocaleString()} ₸
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color Picker */}
          <div className="glass-card">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-semibold">Цвет</h3>
              </div>

              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-16 h-16 rounded-xl cursor-pointer border-2 border-white/20"
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-mono">{selectedColor.toUpperCase()}</p>
                  <p className="text-white/60 text-xs">Выберите свой цвет</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dimensions Control */}
          <div className="glass-card">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-semibold">Размеры (см)</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm">Ширина</label>
                    <span className="text-white font-mono text-sm">{dimensions.width} см</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="300"
                    value={dimensions.width}
                    onChange={(e) => handleDimensionChange('width', parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm">Высота</label>
                    <span className="text-white font-mono text-sm">{dimensions.height} см</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    value={dimensions.height}
                    onChange={(e) => handleDimensionChange('height', parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm">Глубина</label>
                    <span className="text-white font-mono text-sm">{dimensions.depth} см</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={dimensions.depth}
                    onChange={(e) => handleDimensionChange('depth', parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Итоговая цена</p>
                <p className="text-white font-bold text-2xl">{totalPrice.toLocaleString()} ₸</p>
              </div>
              <button
                onClick={handleOrder}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-8 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-orange-500/50 flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Заказать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

