import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        // Не удаляем неиспользуемые функции
        unused: false,
        // Не удаляем мертвый код
        dead_code: false,
        // Не удаляем console
        drop_console: false,
        drop_debugger: false
      },
      mangle: {
        // Не минифицируем имена функций
        keep_fnames: true
      }
    }
  }
})
