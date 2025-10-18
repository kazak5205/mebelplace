import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#FF6600',
          orangeLight: '#FF8533',
          orangeDark: '#FF4500',
        },
        glass: {
          // Glass background colors with transparency
          'bg-primary': 'rgba(255, 255, 255, 0.1)',
          'bg-secondary': 'rgba(255, 255, 255, 0.05)',
          'bg-accent': 'rgba(255, 102, 0, 0.2)',
          'bg-dark': 'rgba(0, 0, 0, 0.1)',
          'bg-light': 'rgba(255, 255, 255, 0.2)',
          // Glass border colors
          'border': 'rgba(255, 255, 255, 0.2)',
          'border-accent': 'rgba(255, 102, 0, 0.3)',
          'border-light': 'rgba(255, 255, 255, 0.3)',
          // Glass text colors
          'text-primary': 'rgba(255, 255, 255, 0.9)',
          'text-secondary': 'rgba(255, 255, 255, 0.7)',
          'text-accent': 'rgba(255, 102, 0, 0.9)',
        },
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'glass-sm': '0 2px 8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-base': '0 4px 16px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'glass-md': '0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.15)',
        'glass-lg': '0 12px 32px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        'glass-xl': '0 16px 48px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.25)',
        'glass-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'glass-gradient-primary': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'glass-gradient-accent': 'linear-gradient(135deg, rgba(255, 102, 0, 0.2) 0%, rgba(255, 102, 0, 0.1) 100%)',
        'glass-gradient-secondary': 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)',
      },
      animation: {
        'glass-shimmer': 'glass-shimmer 2s ease-in-out infinite',
        'glass-pulse': 'glass-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glass-float': 'glass-float 3s ease-in-out infinite',
      },
      keyframes: {
        'glass-shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glass-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'glass-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
