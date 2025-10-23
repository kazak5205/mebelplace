/**
 * Services export - unified API access for mobile app
 * Synchronized with web version
 */

// Export API client and legacy service
export { apiClient, apiService, api } from './apiService';

// Export individual services
export { videoService } from './videoService';
export { orderService } from './orderService';
export { orderStatusService } from './orderStatusService';
export { chatService } from './chatService';
export { authService } from './authService';
export { userService } from './userService';
export { subscriptionService } from './subscriptionService';
export { pushService } from './pushService';

// Export notification service (mobile-specific)
export { notificationService } from './notificationService';

