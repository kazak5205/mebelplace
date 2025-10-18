import { api } from '../client';
import { ReferralCode, ReferralStats } from '@/lib/store/slices/referralSlice';

export const referralService = {
  // Generate referral code
  generateCode: async (): Promise<ReferralCode> => {
    const response = await api.post('/referrals/generate-code');
    return response.data;
  },

  // Apply referral code
  applyCode: async (code: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/referrals/apply-code', { code });
    return response.data;
  },

  // Get referral stats
  getStats: async (): Promise<ReferralStats> => {
    const response = await api.get('/referrals/stats');
    return response.data;
  },
};
