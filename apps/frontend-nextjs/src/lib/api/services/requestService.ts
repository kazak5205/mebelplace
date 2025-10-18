import { api } from '../client';
import { Request, RequestOffer } from '@/lib/store/slices/requestSlice';

export const requestService = {
  // Get requests
  getRequests: async (params: { page?: number; limit?: number; status?: string } = {}): Promise<{ requests: Request[]; pagination: any }> => {
    const response = await api.get('/requests', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        status: params.status,
      },
    });
    return response.data;
  },

  // Create request
  createRequest: async (requestData: {
    title: string;
    description: string;
    category: string;
    budget?: number;
    location?: string;
    images: File[];
  }): Promise<Request> => {
    const formData = new FormData();
    formData.append('title', requestData.title);
    formData.append('description', requestData.description);
    formData.append('category', requestData.category);
    if (requestData.budget) {
      formData.append('budget', requestData.budget.toString());
    }
    if (requestData.location) {
      formData.append('location', requestData.location);
    }
    requestData.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    const response = await api.post('/requests/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get request by ID
  getById: async (requestId: number): Promise<Request> => {
    const response = await api.get(`/requests/${requestId}`);
    return response.data;
  },

  // Get request offers
  getOffers: async (requestId: number): Promise<RequestOffer[]> => {
    const response = await api.get(`/requests/${requestId}/offers`);
    return response.data;
  },

  // Create offer
  createOffer: async (requestId: number, offerData: {
    price: number;
    description: string;
    deliveryTime: string;
  }): Promise<RequestOffer> => {
    const response = await api.post(`/requests/${requestId}/offers/create`, {
      price: offerData.price,
      description: offerData.description,
      delivery_time: offerData.deliveryTime,
    });
    return response.data;
  },

  // Accept offer
  acceptOffer: async (requestId: number, offerId: number): Promise<void> => {
    await api.post(`/requests/${requestId}/offers/${offerId}/accept`);
  },
};
