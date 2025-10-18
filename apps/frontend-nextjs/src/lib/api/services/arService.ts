import { api } from '../client';
import { Model3D, ModelVersion } from '@/lib/store/slices/arSlice';

export const arService = {
  // Get 3D models
  getModels: async (params: {
    page?: number;
    limit?: number;
    user_id?: number;
  } = {}): Promise<{ models: Model3D[]; pagination: any }> => {
    const response = await api.get('/ar/models', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        user_id: params.user_id,
      },
    });
    return response.data;
  },

  // Upload 3D model
  uploadModel: async (modelData: {
    name: string;
    description: string;
    file: File;
  }, onProgress?: (progress: number) => void): Promise<Model3D> => {
    const formData = new FormData();
    formData.append('name', modelData.name);
    formData.append('description', modelData.description);
    formData.append('model', modelData.file);

    const response = await api.post('/ar/models/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  // Get model by ID
  getById: async (modelId: number): Promise<Model3D> => {
    const response = await api.get(`/ar/models/${modelId}`);
    return response.data;
  },

  // Get model versions
  getVersions: async (modelId: number): Promise<ModelVersion[]> => {
    const response = await api.get(`/ar/models/${modelId}/versions`);
    return response.data;
  },

  // Add model version
  addVersion: async (modelId: number, file: File): Promise<ModelVersion> => {
    const formData = new FormData();
    formData.append('model', file);

    const response = await api.post(`/ar/models/${modelId}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Activate model version
  activateVersion: async (modelId: number, versionId: number): Promise<void> => {
    await api.post(`/ar/models/${modelId}/versions/${versionId}/activate`);
  },

  // Validate model
  validateModel: async (modelId: number): Promise<{ is_valid: boolean; errors: string[] }> => {
    const response = await api.post(`/ar/models/${modelId}/validate`);
    return response.data;
  },

  // Render model
  renderModel: async (modelId: number, cameraAngle: string, lighting: string): Promise<{ render_url: string }> => {
    const response = await api.post(`/ar/models/${modelId}/render`, {
      camera_angle: cameraAngle,
      lighting,
    });
    return response.data;
  },

  // Search models
  searchModels: async (query: string, page: number = 1, limit: number = 20): Promise<Model3D[]> => {
    const response = await api.get('/ar/models/search', {
      params: { q: query, page, limit },
    });
    return response.data;
  },
};
