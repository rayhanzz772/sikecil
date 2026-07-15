import api from './api';
import { Measurement } from '../types';

export interface ChildDTO {
  id?: string;
  name: string;
  nik: string;
  birth_date: string;
  gender: 'Laki-laki' | 'Perempuan';
  parent_name?: string;
  parent_nik?: string;
  posyandu_id?: string;
}

export const childService = {
  getAll: async (params?: { search?: string, posyandu_id?: string, page?: number, per_page?: number }) => {
    const response = await api.get('/children', { params: { q: params?.search, posyandu_id: params?.posyandu_id, page: params?.page, per_page: params?.per_page } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/children/${id}`);
    return response.data;
  },

  create: async (data: ChildDTO) => {
    const response = await api.post('/children', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ChildDTO>) => {
    const response = await api.put(`/children/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/children/${id}`);
    return response.data;
  }
};
