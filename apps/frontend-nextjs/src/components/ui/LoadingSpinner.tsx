'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-2 border-gray-600 border-t-[#FF6600] rounded-full animate-spin`} />
      {text && (
        <p className="mt-2 text-gray-400 text-sm">{text}</p>
      )}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-600 border-t-[#FF6600] rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Загрузка MebelPlace</h2>
        <p className="text-gray-400">Подготавливаем всё для вас...</p>
      </div>
    </div>
  )
}

export function ButtonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`} />
  )
}
