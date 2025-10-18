import { api } from '../client';
import { GeoObject, MapReview } from '@/lib/store/slices/mapSlice';

export const mapService = {
  // Get geo objects
  getGeoObjects: async (params: {
    lat?: number;
    lng?: number;
    radius?: number;
    category?: string;
  } = {}): Promise<GeoObject[]> => {
    const response = await api.get('/map/geo-objects', {
      params: {
        latitude: params.lat,
        longitude: params.lng,
        radius: params.radius,
        category: params.category,
      },
    });
    return response.data;
  },

  // Create geo object
  createGeoObject: async (geoObjectData: {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    category: string;
    address: string;
    phone?: string;
    website?: string;
    images: File[];
  }): Promise<GeoObject> => {
    const formData = new FormData();
    formData.append('name', geoObjectData.name);
    formData.append('description', geoObjectData.description);
    formData.append('latitude', geoObjectData.latitude.toString());
    formData.append('longitude', geoObjectData.longitude.toString());
    formData.append('category', geoObjectData.category);
    formData.append('address', geoObjectData.address);
    if (geoObjectData.phone) {
      formData.append('phone', geoObjectData.phone);
    }
    if (geoObjectData.website) {
      formData.append('website', geoObjectData.website);
    }
    geoObjectData.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    const response = await api.post('/map/geo-objects/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get geo object by ID
  getById: async (geoObjectId: number): Promise<GeoObject> => {
    const response = await api.get(`/map/geo-objects/${geoObjectId}`);
    return response.data;
  },

  // Search map objects
  search: async (params: {
    query: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<GeoObject[]> => {
    const response = await api.get('/map/search', {
      params: {
        q: params.query,
        latitude: params.lat,
        longitude: params.lng,
        radius: params.radius,
      },
    });
    return response.data;
  },

  // Get geo object reviews
  getReviews: async (geoObjectId: number): Promise<MapReview[]> => {
    const response = await api.get(`/map/geo-objects/${geoObjectId}/reviews`);
    return response.data;
  },

  // Add geo object review
  addReview: async (geoObjectId: number, rating: number, comment: string): Promise<MapReview> => {
    const response = await api.post(`/map/geo-objects/${geoObjectId}/reviews`, {
      rating,
      comment,
    });
    return response.data;
  },
};
