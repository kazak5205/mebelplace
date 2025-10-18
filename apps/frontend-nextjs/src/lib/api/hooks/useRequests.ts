/**
 * Requests API Hooks
 * React Query hooks for request-related endpoints
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../api-wrapper';

export interface Request {
  id: number;
  title: string;
  description: string;
  category: string;
  region: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  client: {
    id: number;
    username: string;
    avatar: string | null;
  };
  responses_count: number;
  images: string[];
  created_at: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
}

export interface CreateRequestData {
  title: string;
  description: string;
  category: string;
  region: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  images?: File[];
}

export interface RequestResponse {
  id: number;
  request_id: number;
  master: {
    id: number;
    username: string;
    avatar: string | null;
    rating: number;
  };
  message: string;
  price: number;
  estimated_time: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface RequestsQueryParams {
  status?: string;
  region?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface RequestsResponse {
  data: Request[];
  total: number;
  has_more: boolean;
}

// Query Keys
export const requestKeys = {
  all: ['requests'] as const,
  list: (params: RequestsQueryParams) => ['requests', 'list', params] as const,
  detail: (id: number) => ['requests', 'detail', id] as const,
  responses: (id: number) => ['requests', 'responses', id] as const,
  myRequests: ['requests', 'my'] as const,
};

// Get requests feed (alias for backwards compatibility)
export function useRequestsFeed(
  params: RequestsQueryParams = {},
  options?: Omit<UseQueryOptions<RequestsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useRequests(params, options);
}

// Get requests list
export function useRequests(
  params: RequestsQueryParams = {},
  options?: Omit<UseQueryOptions<RequestsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<RequestsResponse, Error>({
    queryKey: requestKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.region) searchParams.set('region', params.region);
      if (params.category) searchParams.set('category', params.category);
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.offset) searchParams.set('offset', params.offset.toString());

      return api.get<RequestsResponse>(
        `/requests?${searchParams.toString()}`
      );
    },
    ...options,
  });
}

// Get single request
export function useRequest(
  requestId: number,
  options?: Omit<UseQueryOptions<Request, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Request, Error>({
    queryKey: requestKeys.detail(requestId),
    queryFn: () => api.get<Request>(`/requests/${requestId}`),
    enabled: requestId > 0,
    ...options,
  });
}

// Get request responses
export function useRequestResponses(
  requestId: number,
  options?: Omit<UseQueryOptions<RequestResponse[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<RequestResponse[], Error>({
    queryKey: requestKeys.responses(requestId),
    queryFn: () => api.get<RequestResponse[]>(`/requests/${requestId}/responses`),
    enabled: requestId > 0,
    ...options,
  });
}

// Create request mutation
export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation<Request, Error, CreateRequestData>({
    mutationFn: async (data: CreateRequestData) => {
      if (data.images && data.images.length > 0) {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('region', data.region);
        if (data.budget_min) formData.append('budget_min', data.budget_min.toString());
        if (data.budget_max) formData.append('budget_max', data.budget_max.toString());
        if (data.deadline) formData.append('deadline', data.deadline);
        
        data.images.forEach((image) => {
          formData.append('images', image);
        });

        return api.post<Request>('/requests', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      return api.post<Request>('/requests', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
    },
  });
}

// Respond to request mutation
export interface RespondToRequestData {
  message: string;
  price: number;
  estimated_time: string;
}

export function useRespondToRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    RequestResponse,
    Error,
    { requestId: number; data: RespondToRequestData }
  >({
    mutationFn: ({ requestId, data }) =>
      api.post<RequestResponse>(`/requests/${requestId}/respond`, data),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.responses(requestId) });
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId) });
    },
  });
}

// Update request status
export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    Request,
    Error,
    { requestId: number; status: Request['status'] }
  >({
    mutationFn: ({ requestId, status }) =>
      api.patch<Request>(`/requests/${requestId}`, { status }),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
    },
  });
}

