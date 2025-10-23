// Единые анимации для веба и мобилки
export const animations = {
  // Базовые переходы
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },
  
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: { 
      duration: 0.5, 
      ease: [0.68, -0.55, 0.265, 1.55],
      times: [0, 0.5, 0.7, 1]
    }
  },
  
  // Ховер эффекты
  hover: {
    scale: 1.05,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },
  
  hoverLift: {
    y: -2,
    scale: 1.02,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },
  
  // Нажатия
  tap: {
    scale: 0.95,
    transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] }
  },
  
  // Списки с задержкой
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  // Лоадеры
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: "linear" }
  },
  
  pulse: {
    animate: { 
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1]
    },
    transition: { 
      duration: 2, 
      repeat: Infinity, 
      ease: [0.4, 0, 0.6, 1] 
    }
  },
  
  // Появление модалов
  modal: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  
  // Свайпы для мобилки
  swipeUp: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { 
      type: 'spring', 
      damping: 30, 
      stiffness: 300 
    }
  },
  
  // Карточки
  card: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  
  // Кнопки
  button: {
    whileHover: { 
      scale: 1.05,
      y: -1,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    },
    whileTap: { 
      scale: 0.95,
      transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] }
    }
  }
}

// Префиксы для мобилки (React Native)
export const mobileAnimations = {
  fadeIn: {
    opacity: 1,
    duration: 400,
    easing: 'ease-out'
  },
  
  slideUp: {
    translateY: 0,
    opacity: 1,
    duration: 300,
    easing: 'ease-out'
  },
  
  scaleIn: {
    scale: 1,
    opacity: 1,
    duration: 200,
    easing: 'ease-out'
  },
  
  bounceIn: {
    scale: 1,
    opacity: 1,
    duration: 500,
    easing: 'bounce'
  }
}

// Утилиты для анимаций
export const getStaggerDelay = (index: number, delay: number = 0.1) => ({
  transition: { delay: index * delay }
})

export const getPageTransition = (direction: 'left' | 'right' | 'up' | 'down' = 'up') => {
  const directions = {
    left: { x: -300, y: 0 },
    right: { x: 300, y: 0 },
    up: { x: 0, y: -300 },
    down: { x: 0, y: 300 }
  }
  
  return {
    initial: { opacity: 0, ...directions[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...directions[direction] },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
}
