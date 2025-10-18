import { api } from '../client';
import { Call } from '@/lib/store/slices/callSlice';

export const callService = {
  // Initiate call
  initiateCall: async (calleeId: number, type: 'audio' | 'video'): Promise<Call> => {
    const response = await api.post('/calls/initiate', {
      callee_id: calleeId,
      type,
    });
    return response.data;
  },

  // Answer call
  answerCall: async (callId: number): Promise<Call> => {
    const response = await api.post(`/calls/${callId}/answer`);
    return response.data;
  },

  // End call
  endCall: async (callId: number): Promise<void> => {
    await api.post(`/calls/${callId}/end`);
  },

  // Reject call
  rejectCall: async (callId: number): Promise<void> => {
    await api.post(`/calls/${callId}/reject`);
  },

  // Get call history
  getCallHistory: async (): Promise<Call[]> => {
    const response = await api.get('/calls/history');
    return response.data;
  },

  // Get active calls
  getActiveCalls: async (): Promise<Call[]> => {
    const response = await api.get('/calls/active');
    return response.data;
  },

  // Get WebRTC token
  getWebRTCToken: async (): Promise<{ token: string; config: any }> => {
    const response = await api.get('/calls/webrtc-token');
    return response.data;
  },

  // Get call statistics
  getCallStats: async (): Promise<any> => {
    const response = await api.get('/calls/stats');
    return response.data;
  },

  // Get extended WebRTC token
  getExtendedWebRTCToken: async (callId: number): Promise<{ token: string; config: any }> => {
    const response = await api.get(`/calls/${callId}/webrtc-token/extended`);
    return response.data;
  },

  // Validate WebRTC token
  validateWebRTCToken: async (token: string): Promise<{ is_valid: boolean; expires_at: string }> => {
    const response = await api.post('/calls/webrtc-token/validate', { token });
    return response.data;
  },

  // Send call notification
  sendCallNotification: async (callId: number, type: 'incoming' | 'missed' | 'ended'): Promise<void> => {
    await api.post('/calls/notification', {
      call_id: callId,
      type,
    });
  },
};
