import api from './api';

export interface Desa {
  id: string;
  name: string;
  kecamatan: string;
  kabupaten: string;
  created_at?: string;
  updated_at?: string;
}

export const desaService = {
  getAll: async (params?: { search?: string, page?: number, per_page?: number }) => {
    const response = await api.get('/desa', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/desa/${id}`);
    return response.data;
  },

  create: async (data: { name: string; kecamatan: string; kabupaten: string }) => {
    const response = await api.post('/desa', data);
    return response.data;
  },

  update: async (id: string, data: { name: string; kecamatan: string; kabupaten: string }) => {
    const response = await api.put(`/desa/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/desa/${id}`);
    return response.data;
  }
};
