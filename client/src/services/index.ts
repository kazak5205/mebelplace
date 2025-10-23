// Экспорт всех сервисов для удобного импорта
export { apiService } from './api'
export { authService } from './authService'
export { videoService } from './videoService'
export { orderService } from './orderService'
export { chatService } from './chatService'
export { notificationService } from './notificationService'
export { pushService } from './pushService'
export { adminService } from './adminService'

// Re-export типов для удобства
export type { Notification } from './notificationService'

