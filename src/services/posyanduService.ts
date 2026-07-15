import api from './api';
import { Desa } from './desaService';

export interface Posyandu {
  id: string;
  name: string;
  desa_id: string;
  desa?: Desa;
  created_at?: string;
  updated_at?: string;
}

export const posyanduService = {
  getAll: async (params?: { search?: string, desa_id?: string, page?: number, per_page?: number }) => {
    const response = await api.get('/posyandu', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/posyandu/${id}`);
    return response.data;
  },

  create: async (data: { name: string; desa_id: string }) => {
    const response = await api.post('/posyandu', data);
    return response.data;
  },

  update: async (id: string, data: { name: string; desa_id: string }) => {
    const response = await api.put(`/posyandu/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/posyandu/${id}`);
    return response.data;
  }
};
