/**
 * VoiceControl - Voice assistant UI
 * Per TZ: Voice search, voice navigation, dictation
 * Premium glassmorphism iOS26 design
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, X, Volume2, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface VoiceControlProps {
  isOpen: boolean
  onClose: () => void
  onCommand?: (command: string) => void
}

export function VoiceControl({ isOpen, onClose, onCommand }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [waveform, setWaveform] = useState<number[]>([])
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (!isOpen) return

    // Check Web Speech API support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'ru-RU'

      recognitionRef.current.onresult = (event: any) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            final += result[0].transcript
            setConfidence(result[0].confidence)
          } else {
            interim += result[0].transcript
          }
        }

        if (final) {
          setTranscript(final)
          onCommand?.(final)
        }
        setInterimTranscript(interim)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isOpen, onCommand])

  // Simulated waveform animation
  useEffect(() => {
    if (!isListening) {
      setWaveform([])
      return
    }

    const interval = setInterval(() => {
      const newWave = Array.from({ length: 20 }, () => Math.random() * 100)
      setWaveform(newWave)
    }, 100)

    return () => clearInterval(interval)
  }, [isListening])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
      setTranscript('')
      setInterimTranscript('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-2xl bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="glass-card p-8 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 max-w-lg w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">Голосовой помощник</h2>
                <p className="text-white/60 text-sm">Скажите что вам нужно</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Waveform Visualization */}
          <div className="h-32 flex items-center justify-center gap-1">
            {isListening ? (
              waveform.map((height, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-orange-500 to-orange-300 rounded-full transition-all duration-100"
                  style={{ height: `${height}%` }}
                />
              ))
            ) : (
              <div className="text-center">
                <Mic className="w-16 h-16 text-white/40 mx-auto mb-2" />
                <p className="text-white/60 text-sm">Нажмите для начала</p>
              </div>
            )}
          </div>

          {/* Transcript */}
          <div className="min-h-[80px]">
            {(transcript || interimTranscript) && (
              <div className="glass-card p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-white text-lg leading-relaxed">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-white/50">{interimTranscript}</span>
                  )}
                </p>
                {transcript && confidence > 0 && (
                  <p className="text-white/40 text-xs mt-2">
                    Уверенность: {Math.round(confidence * 100)}%
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Mic Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleListening}
              className={`relative w-24 h-24 rounded-full transition-all transform ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-2xl shadow-red-500/50'
                  : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105 shadow-2xl shadow-orange-500/50'
              } active:scale-95`}
              aria-label={isListening ? 'Остановить запись' : 'Начать запись'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-10 h-10 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  {/* Pulsing ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-50" />
                </>
              ) : (
                <Mic className="w-10 h-10 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </button>
          </div>

          {/* Command suggestions */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['Поиск кухни', 'Профиль мастера', 'Мои заказы'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setTranscript(suggestion)
                  onCommand?.(suggestion)
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

