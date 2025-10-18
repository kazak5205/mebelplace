/**
 * Animation System - Полная система анимаций для Glass UI
 * Полностью соответствует спецификации FRONTEND_API_SPECIFICATION.yaml
 */

import { Variants } from 'framer-motion';

// Duration constants
export const DURATION = {
  FAST: 150,
  DEFAULT: 300,
  SLOW: 500,
  SLOWER: 800,
  DOUBLE_TAP_LIKE: 400,
  SKELETON_PULSE: 2000,
  MODAL_OPEN: 300,
  MODAL_CLOSE: 200,
  BUTTON_PRESS: 120,
  CARD_HOVER: 200,
  INPUT_FOCUS: 150,
  TOAST_SHOW: 300,
  TOAST_HIDE: 200,
  LOADING_SPINNER: 1000,
  PROGRESS_BAR: 500,
} as const;

// Easing curves
export const EASING = {
  DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  SPRING: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  BOUNCE: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  ELASTIC: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  BACK: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  CIRC: 'cubic-bezier(0.6, 0.04, 0.98, 0.34)',
  EXPO: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
} as const;

// Scale values
export const SCALE = {
  BUTTON_PRESS: 0.95,
  BUTTON_HOVER: 1.02,
  CARD_HOVER: 1.03,
  DOUBLE_TAP_START: 0.8,
  DOUBLE_TAP_PEAK: 1.2,
  DOUBLE_TAP_END: 1.0,
  MODAL_SCALE: 0.95,
  TOAST_SCALE: 0.8,
  LOADING_SCALE: 0.9,
  ICON_SCALE: 1.1,
  AVATAR_SCALE: 1.05,
  BADGE_SCALE: 1.2,
} as const;

// Page transition variants
export const pageTransitions: Variants = {
  fadeScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: DURATION.DEFAULT / 1000, ease: EASING.EASE_OUT },
  },
  slideFromRight: {
    initial: { opacity: 0, x: '100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' },
    transition: { duration: DURATION.DEFAULT / 1000, ease: EASING.EASE_OUT },
  },
  slideFromLeft: {
    initial: { opacity: 0, x: '-100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '-100%' },
    transition: { duration: DURATION.DEFAULT / 1000, ease: EASING.EASE_OUT },
  },
  slideUp: {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
    transition: { duration: DURATION.DEFAULT / 1000, ease: EASING.EASE_OUT },
  },
  slideDown: {
    initial: { opacity: 0, y: '-100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '-100%' },
    transition: { duration: DURATION.DEFAULT / 1000, ease: EASING.EASE_OUT },
  },
  rotationFade: {
    initial: { opacity: 0, rotate: 0 },
    animate: { opacity: 1, rotate: 360 },
    exit: { opacity: 0, rotate: 0 },
    transition: { duration: DURATION.SLOW / 1000, ease: EASING.ELASTIC },
  },
  flip: {
    initial: { opacity: 0, rotateY: 0 },
    animate: { opacity: 1, rotateY: 180 },
    exit: { opacity: 0, rotateY: 0 },
    transition: { duration: DURATION.SLOW / 1000, ease: EASING.EASE_OUT },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: DURATION.DEFAULT / 1000, ease: EASING.EASE_OUT },
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' },
    transition: { duration: DURATION.CARD_HOVER / 1000, ease: EASING.EASE_OUT },
  },
  wipe: {
    initial: { clipPath: 'inset(0 100% 0 0)' },
    animate: { clipPath: 'inset(0 0 0 0)' },
    exit: { clipPath: 'inset(0 100% 0 0)' },
    transition: { duration: DURATION.SLOW / 1000, ease: EASING.EASE_OUT },
  },
};

// Glass UI animation variants
export const glassAnimations: Variants = {
  shimmer: {
    initial: { backgroundPosition: '-200% 0' },
    animate: { backgroundPosition: '200% 0' },
    transition: { duration: DURATION.SKELETON_PULSE / 1000, repeat: Infinity, ease: 'linear' },
  },
  pulse: {
    animate: {
      opacity: [0.8, 1, 0.8],
    },
    transition: {
      duration: DURATION.SKELETON_PULSE / 1000,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  float: {
    animate: {
      y: [0, -4, 0],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  backdropBlur: {
    initial: { backdropFilter: 'blur(0px)' },
    animate: { backdropFilter: 'blur(12px)' },
    exit: { backdropFilter: 'blur(0px)' },
    transition: { duration: DURATION.DEFAULT / 1000, ease: EASING.EASE_OUT },
  },
  glow: {
    animate: {
      boxShadow: [
        '0 0 0 rgba(255,102,0,0)',
        '0 0 20px rgba(255,102,0,0.5)',
        '0 0 0 rgba(255,102,0,0)',
      ],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: DURATION.SLOW / 1000, ease: EASING.EASE_OUT },
  },
  slide: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { duration: DURATION.DEFAULT / 1000, ease: EASING.EASE_OUT },
  },
  rotate: {
    animate: { rotate: 360 },
    transition: { duration: 0.6, ease: 'linear' },
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: DURATION.CARD_HOVER / 1000, ease: EASING.EASE_OUT },
  },
  border: {
    initial: { borderColor: 'transparent' },
    animate: { borderColor: 'rgba(255,255,255,0.3)' },
    exit: { borderColor: 'transparent' },
    transition: { duration: DURATION.PROGRESS_BAR / 1000, ease: EASING.EASE_OUT },
  },
};

// Physics animations
export const physicsAnimations: Variants = {
  spring: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 1, ease: EASING.ELASTIC },
  },
  elastic: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.8, ease: EASING.ELASTIC },
  },
  bounce: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.6, ease: EASING.BOUNCE },
  },
  gravity: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 1.2, ease: EASING.EASE_IN },
  },
  momentum: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 1.5, ease: EASING.EASE_OUT },
  },
  collision: {
    initial: { scale: 1.2, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.4, ease: EASING.BOUNCE },
  },
  orbit: {
    animate: { rotate: 360 },
    transition: { duration: 2, ease: 'linear', repeat: Infinity },
  },
  wave: {
    animate: { 
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
    },
    transition: { 
      duration: 0.8, 
      repeat: Infinity, 
      ease: 'easeInOut' 
    },
  },
  pendulum: {
    animate: { 
      rotate: [0, 15, -15, 0],
    },
    transition: { 
      duration: 1, 
      repeat: Infinity, 
      ease: 'easeInOut' 
    },
  },
  rubber: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { duration: 0.6, ease: EASING.ELASTIC },
  },
};

// Button animations
export const buttonAnimations: Variants = {
  press: {
    scale: SCALE.BUTTON_PRESS,
    transition: { duration: DURATION.BUTTON_PRESS / 1000 },
  },
  hover: {
    scale: SCALE.BUTTON_HOVER,
    transition: { duration: DURATION.CARD_HOVER / 1000 },
  },
  ripple: {
    scale: [1, 2],
    opacity: [0.6, 0],
    transition: { duration: 0.6, ease: EASING.EASE_OUT },
  },
  glow: {
    boxShadow: [
      '0 0 0 rgba(255,102,0,0)',
      '0 0 20px rgba(255,102,0,0.5)',
      '0 0 0 rgba(255,102,0,0)',
    ],
    transition: { duration: DURATION.DEFAULT / 1000, ease: EASING.EASE_OUT },
  },
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: DURATION.PROGRESS_BAR / 1000 },
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
  },
  bounce: {
    y: [0, -10, 0],
    transition: { duration: DURATION.SLOW / 1000, ease: EASING.EASE_OUT },
  },
  wiggle: {
    rotate: [0, -5, 5, -5, 5, 0],
    transition: { duration: DURATION.DEFAULT / 1000 },
  },
  flash: {
    opacity: [1, 0, 1],
    transition: { duration: DURATION.CARD_HOVER / 1000 },
  },
  slide: {
    x: [0, 20, 0],
    transition: { duration: DURATION.DEFAULT / 1000 },
  },
  rotate: {
    rotate: 360,
    transition: { duration: DURATION.SLOW / 1000, ease: 'linear' },
  },
};

// Particle system configurations
export const particleConfigs = {
  confetti: {
    count: 50,
    duration: 2000,
    colors: ['#FF6600', '#FF8533', '#FFB366', '#FFD9B3', '#FFF2E6'],
    effects: ['gravity', 'wind', 'bounce'],
  },
  stars: {
    count: 30,
    duration: 1500,
    colors: ['#FFD700', '#FFA500', '#FF6347'],
    effects: ['rotation', 'fade'],
  },
  hearts: {
    count: 20,
    duration: 2000,
    colors: ['#FF6B9D', '#FF8E9B', '#FFB3BA'],
    effects: ['float', 'pulse'],
  },
  sparkles: {
    count: 40,
    duration: 1000,
    colors: ['#FFD700', '#FFA500', '#FF6347'],
    effects: ['burst', 'fade'],
  },
  fireworks: {
    count: 100,
    duration: 3000,
    colors: ['#FF6600', '#FF8533', '#FFB366', '#FFD9B3', '#FFF2E6', '#FF4500', '#FF8C00'],
    effects: ['explosion', 'gravity'],
  },
  rain: {
    count: 200,
    duration: 4000,
    colors: ['#87CEEB', '#4682B4'],
    effects: ['gravity', 'wind'],
  },
  snow: {
    count: 150,
    duration: 5000,
    colors: ['#FFFFFF'],
    effects: ['float', 'rotation'],
  },
  bubbles: {
    count: 30,
    duration: 2500,
    colors: ['#87CEEB', '#4682B4', '#5F9EA0', '#6495ED'],
    effects: ['float', 'scale'],
  },
  dust: {
    count: 80,
    duration: 1000,
    colors: ['#D2B48C', '#F5DEB3'],
    effects: ['fade', 'gravity'],
  },
  lightning: {
    count: 20,
    duration: 500,
    colors: ['#FFFF00', '#FFD700'],
    effects: ['flash', 'fade'],
  },
};

// Contextual animations
export const contextualAnimations = {
  success: {
    variants: physicsAnimations.confetti,
    particles: particleConfigs.confetti,
  },
  error: {
    variants: buttonAnimations.shake,
    particles: particleConfigs.dust,
  },
  warning: {
    variants: buttonAnimations.pulse,
    particles: particleConfigs.sparkles,
  },
  info: {
    variants: glassAnimations.fade,
    particles: particleConfigs.bubbles,
  },
};

// Accessibility animations (reduced motion)
export const reducedMotionAnimations: Variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1 },
  },
  none: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
    transition: { duration: 0 },
  },
};

// Utility functions
export const getReducedMotionAnimations = (prefersReducedMotion: boolean) => {
  if (prefersReducedMotion) {
    return reducedMotionAnimations;
  }
  return {};
};

export const createStaggerAnimation = (delay: number = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: delay,
    },
  },
});

export const createStaggerChild = () => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
});

// Animation presets for common use cases
export const animationPresets = {
  page: pageTransitions.fadeScale,
  modal: pageTransitions.slideUp,
  toast: glassAnimations.slide,
  button: buttonAnimations.press,
  card: glassAnimations.scale,
  loading: glassAnimations.rotate,
  progress: glassAnimations.border,
  skeleton: glassAnimations.shimmer,
  tooltip: glassAnimations.fade,
  dropdown: pageTransitions.slideDown,
  accordion: glassAnimations.slide,
  carousel: pageTransitions.slideFromRight,
  tabs: glassAnimations.fade,
  notification: buttonAnimations.bounce,
  achievement: physicsAnimations.spring,
  like: buttonAnimations.ripple,
  share: physicsAnimations.bounce,
  download: physicsAnimations.gravity,
  upload: glassAnimations.progress,
  search: glassAnimations.fade,
  filter: pageTransitions.slideDown,
  sort: physicsAnimations.rotate,
  expand: glassAnimations.scale,
  collapse: glassAnimations.fade,
  refresh: glassAnimations.rotate,
  success: contextualAnimations.success.variants,
  error: contextualAnimations.error.variants,
  warning: contextualAnimations.warning.variants,
  info: contextualAnimations.info.variants,
} as const;

export default {
  DURATION,
  EASING,
  SCALE,
  pageTransitions,
  glassAnimations,
  physicsAnimations,
  buttonAnimations,
  particleConfigs,
  contextualAnimations,
  reducedMotionAnimations,
  animationPresets,
  getReducedMotionAnimations,
  createStaggerAnimation,
  createStaggerChild,
};
