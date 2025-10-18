/**
 * ARViewer - Augmented Reality furniture viewer
 * Per TZ: "Попробовать мебель в комнате" через AR
 * Premium iOS26 glassmorphism design
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Move, ZoomIn, ZoomOut, Camera, Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui'

interface ARViewerProps {
  productId: string
  productName: string
  modelUrl: string // 3D model URL (.glb or .usdz)
  onClose: () => void
  onPlaceOrder?: () => void
}

export function ARViewer({
  productId,
  productName,
  modelUrl,
  onClose,
  onPlaceOrder,
}: ARViewerProps) {
  const [isARSupported, setIsARSupported] = useState(false)
  const [isPlaced, setIsPlaced] = useState(false)
  const [mode, setMode] = useState<'move' | 'rotate' | 'scale'>('move')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check AR support (WebXR or ARCore/ARKit)
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        const xr = (navigator as any).xr
        if (xr) {
          const supported = await xr.isSessionSupported('immersive-ar')
          setIsARSupported(supported)
        }
      }
      
      // Fallback: check for iOS ARKit
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS && 'DeviceOrientationEvent' in window) {
        setIsARSupported(true)
      }
    }

    checkARSupport()
  }, [])

  const handleStartAR = () => {
    setIsPlaced(true)
    // AR session would start here
    // For now: show AR UI overlay
  }

  const handleTakeScreenshot = () => {
    // Capture AR scene as screenshot
    setScreenshot('/api/placeholder/ar-screenshot.jpg')
  }

  const handleSaveConfiguration = () => {
    // Save AR configuration to order
    console.log('AR configuration saved')
    onPlaceOrder?.()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* AR Canvas / Camera View */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"
      >
        {/* AR placeholder - в production здесь WebXR canvas */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaced ? (
            <div className="glass-card">
              <div className="text-center space-y-6 p-8">
                <div className="w-20 h-20 mx-auto bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    AR режим
                  </h2>
                  <p className="text-white/80 text-sm max-w-xs mx-auto">
                    Наведите камеру на пол или стену, затем нажмите на экран чтобы разместить мебель
                  </p>
                </div>

                {!isARSupported && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                    <p className="text-yellow-200 text-sm">
                      ⚠️ AR не поддерживается на этом устройстве. Попробуйте на iOS или Android с ARCore
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleStartAR}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  disabled={!isARSupported}
                >
                  {isARSupported ? 'Начать AR' : 'AR недоступен'}
                </Button>
              </div>
            </div>
          ) : (
            /* AR placed - show 3D model overlay */
            <div className="absolute inset-0">
              {/* Simulated AR view */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-50" />
              
              {/* 3D model placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-3xl backdrop-blur-xl border-2 border-orange-500/50 flex items-center justify-center">
                    <span className="text-6xl">🪑</span>
                  </div>
                  
                  {/* AR Grid indicator */}
                  <div className="absolute -inset-4 border-2 border-dashed border-orange-500/30 rounded-3xl animate-pulse" />
                </div>
              </div>

              {/* AR Instructions overlay */}
              <div className="glass-card absolute top-20 left-1/2 -translate-x-1/2">
                <p className="text-white text-sm font-medium text-center">
                  ✨ Мебель размещена! Используйте жесты для настройки
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 inset-x-0 p-4 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="glass-card">
            <h3 className="text-white font-semibold">{productName}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-3 bg-black/50 backdrop-blur-xl rounded-full hover:bg-black/70 transition-colors"
            aria-label="Закрыть AR"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Controls (glassmorphism) */}
      {isPlaced && (
        <div className="absolute bottom-0 inset-x-0 p-6 safe-area-bottom">
          <div className="space-y-4">
            {/* Mode selector */}
            <div className="glass-card">
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setMode('move')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    mode === 'move'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Move className="w-5 h-5" />
                  <span className="font-medium">Переместить</span>
                </button>

                <button
                  onClick={() => setMode('rotate')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    mode === 'rotate'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <RotateCw className="w-5 h-5" />
                  <span className="font-medium">Повернуть</span>
                </button>

                <button
                  onClick={() => setMode('scale')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    mode === 'scale'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <ZoomIn className="w-5 h-5" />
                  <span className="font-medium">Масштаб</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleTakeScreenshot}
                className="flex-1 bg-white/20 backdrop-blur-xl text-white font-semibold py-4 px-6 rounded-xl hover:bg-white/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Сохранить фото
              </button>

              <button
                onClick={handleSaveConfiguration}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-orange-500/50 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Заказать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot preview */}
      {screenshot && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass-card">
            <div className="space-y-4">
              <img src={screenshot} alt="AR Screenshot" className="w-full rounded-xl" />
              
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setScreenshot(null)}
                >
                  Продолжить AR
                </Button>
                <Button
                  fullWidth
                  onClick={handleSaveConfiguration}
                >
                  Заказать с этим видом
                </Button>
              </div>
            </div>
            </div>
        </div>
      )}
    </div>
  )
}

