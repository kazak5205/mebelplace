import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { store } from '@/lib/store';
import { refreshToken, clearCredentials } from '@/lib/store/slices/authSlice';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
      'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const state = store.getState();
      const refreshTokenValue = state.auth.refreshToken;

      if (refreshTokenValue) {
        try {
          await store.dispatch(refreshToken(refreshTokenValue)).unwrap();
          
          // Retry original request with new token
          const newState = store.getState();
          if (newState.auth.accessToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newState.auth.accessToken}`;
          }
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          store.dispatch(clearCredentials());
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout user
        store.dispatch(clearCredentials());
        window.location.href = '/auth/login';
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        console.warn(`⏳ Rate limited. Retry after ${retryAfter} seconds`);
        // You can implement retry logic here
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network Error:', error.message);
      // You can show a network error toast here
    }

    return Promise.reject(error);
  }
);

// API Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// Error handler utility
export const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      message: (data as any)?.message || `HTTP Error ${status}`,
      status,
      code: (data as any)?.code,
      details: data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network Error - No response from server',
      code: 'NETWORK_ERROR',
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }
};

// API Methods
export const api = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.get(url, config).then(response => ({
      data: response.data,
      status: response.status,
    })),

  // POST request
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.post(url, data, config).then(response => ({
      data: response.data,
      status: response.status,
    })),

  // PUT request
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.put(url, data, config).then(response => ({
      data: response.data,
      status: response.status,
    })),

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data, config).then(response => ({
      data: response.data,
      status: response.status,
    })),

  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.delete(url, config).then(response => ({
      data: response.data,
      status: response.status,
    })),

  // Upload file
  upload: <T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }).then(response => ({
      data: response.data,
      status: response.status,
    }));
  },
};

export default apiClient;