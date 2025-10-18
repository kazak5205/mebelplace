import { api } from '../client';
import { PaymentProvider, Transaction } from '@/lib/store/slices/paymentSlice';

export const paymentService = {
  // Get payment providers
  getProviders: async (): Promise<PaymentProvider[]> => {
    const response = await api.get('/payments/providers');
    return response.data;
  },

  // Connect payment provider
  connectProvider: async (providerId: number, config: any): Promise<PaymentProvider> => {
    const response = await api.post(`/payments/providers/${providerId}/connect`, {
      config,
    });
    return response.data;
  },

  // Get transactions
  getTransactions: async (params: {
    page?: number;
    limit?: number;
    type?: string;
  } = {}): Promise<{ transactions: Transaction[]; pagination: any }> => {
    const response = await api.get('/payments/transactions', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        type: params.type,
      },
    });
    return response.data;
  },

  // Process payment
  processPayment: async (paymentData: {
    amount: number;
    currency: string;
    description: string;
    providerId: number;
  }): Promise<Transaction> => {
    const response = await api.post('/payments/process', {
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
      provider_id: paymentData.providerId,
    });
    return response.data;
  },

  // Refund payment
  refundPayment: async (transactionId: number, amount?: number, reason: string = ''): Promise<Transaction> => {
    const response = await api.post(`/payments/transactions/${transactionId}/refund`, {
      amount,
      reason,
    });
    return response.data;
  },
};
