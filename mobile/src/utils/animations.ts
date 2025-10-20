import { Animated, Easing } from 'react-native';

// Единые анимации для мобилки (React Native)
export const animations = {
  // Базовые переходы
  fadeIn: {
    duration: 400,
    easing: Easing.out(Easing.cubic),
    toValue: 1,
    useNativeDriver: true,
  },
  
  slideUp: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    toValue: 0,
    useNativeDriver: true,
  },
  
  slideDown: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    toValue: 0,
    useNativeDriver: true,
  },
  
  slideLeft: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    toValue: 0,
    useNativeDriver: true,
  },
  
  slideRight: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    toValue: 0,
    useNativeDriver: true,
  },
  
  scaleIn: {
    duration: 200,
    easing: Easing.out(Easing.cubic),
    toValue: 1,
    useNativeDriver: true,
  },
  
  bounceIn: {
    duration: 500,
    easing: Easing.bounce,
    toValue: 1,
    useNativeDriver: true,
  },
  
  // Ховер эффекты (для веб-версии в мобилке)
  hover: {
    duration: 200,
    easing: Easing.out(Easing.cubic),
    toValue: 1.05,
    useNativeDriver: true,
  },
  
  // Нажатия
  tap: {
    duration: 100,
    easing: Easing.out(Easing.cubic),
    toValue: 0.95,
    useNativeDriver: true,
  },
  
  // Лоадеры
  spin: {
    duration: 1000,
    easing: Easing.linear,
    toValue: 1,
    useNativeDriver: true,
  },
  
  pulse: {
    duration: 2000,
    easing: Easing.inOut(Easing.cubic),
    toValue: 1,
    useNativeDriver: true,
  },
};

// Утилиты для создания анимаций
export const createFadeIn = (value: Animated.Value, delay: number = 0) => {
  return Animated.timing(value, {
    ...animations.fadeIn,
    delay,
  });
};

export const createSlideUp = (value: Animated.Value, delay: number = 0) => {
  return Animated.timing(value, {
    ...animations.slideUp,
    delay,
  });
};

export const createScaleIn = (value: Animated.Value, delay: number = 0) => {
  return Animated.timing(value, {
    ...animations.scaleIn,
    delay,
  });
};

export const createBounceIn = (value: Animated.Value, delay: number = 0) => {
  return Animated.timing(value, {
    ...animations.bounceIn,
    delay,
  });
};

// Создание анимации списка с задержкой
export const createStaggeredAnimation = (
  values: Animated.Value[],
  animationType: 'fadeIn' | 'slideUp' | 'scaleIn' = 'fadeIn',
  staggerDelay: number = 100
) => {
  const animations = values.map((value, index) => {
    const delay = index * staggerDelay;
    
    switch (animationType) {
      case 'fadeIn':
        return createFadeIn(value, delay);
      case 'slideUp':
        return createSlideUp(value, delay);
      case 'scaleIn':
        return createScaleIn(value, delay);
      default:
        return createFadeIn(value, delay);
    }
  });
  
  return Animated.stagger(staggerDelay, animations);
};

// Анимация появления карточки
export const cardAnimation = {
  initial: {
    opacity: 0,
    translateY: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    translateY: 0,
    scale: 1,
  },
  duration: 400,
  easing: Easing.out(Easing.cubic),
};

// Анимация кнопки
export const buttonAnimation = {
  pressIn: {
    scale: 0.95,
    duration: 100,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  pressOut: {
    scale: 1,
    duration: 100,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
};

// Анимация модального окна
export const modalAnimation = {
  slideUp: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  fadeIn: {
    duration: 200,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
};

// Создание анимации появления страницы
export const createPageTransition = (
  opacityValue: Animated.Value,
  translateYValue: Animated.Value,
  direction: 'up' | 'down' | 'left' | 'right' = 'up'
) => {
  const initialValues = {
    up: { opacity: 0, translateY: 300 },
    down: { opacity: 0, translateY: -300 },
    left: { opacity: 0, translateX: 300 },
    right: { opacity: 0, translateX: -300 },
  };
  
  const initialValue = initialValues[direction];
  
  return Animated.parallel([
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(translateYValue, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);
};

// Анимация загрузки
export const createLoadingAnimation = (rotateValue: Animated.Value) => {
  return Animated.loop(
    Animated.timing(rotateValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

// Анимация пульсации
export const createPulseAnimation = (scaleValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.1,
        duration: 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ])
  );
};
