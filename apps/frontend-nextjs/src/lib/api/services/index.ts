// API Services - Centralized API layer
export { authService } from './authService';
export { videoService } from './videoService';
export { chatService } from './chatService';
export { requestService } from './requestService';
export { callService } from './callService';
export { notificationService } from './notificationService';
export { analyticsService } from './analyticsService';
export { gamificationService } from './gamificationService';
export { mapService } from './mapService';
export { paymentService } from './paymentService';
export { arService } from './arService';
export { storyService } from './storyService';
export { referralService } from './referralService';

// Re-export all services as a single object
export const apiServices = {
  auth: authService,
  video: videoService,
  chat: chatService,
  request: requestService,
  call: callService,
  notification: notificationService,
  analytics: analyticsService,
  gamification: gamificationService,
  map: mapService,
  payment: paymentService,
  ar: arService,
  story: storyService,
  referral: referralService,
};

export default apiServices;
