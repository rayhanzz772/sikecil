import api from './api';

export interface TipsFilter {
  page?: number;
  per_page?: number;
  posyandu_id?: string;
  month?: number;
  year?: number;
}

export interface TipsPayload {
  title: string;
  description: string;
  image?: string;
  posyandu_id?: string;
  month?: number;
  year?: number;
}

export const tipsService = {
  getTips: async (params?: TipsFilter) => {
    const response = await api.get('/tips', { params });
    return response.data;
  },

  getTipDetail: async (id: string) => {
    const response = await api.get(`/tips/${id}`);
    return response.data;
  },

  createTip: async (data: TipsPayload) => {
    const response = await api.post('/tips', data);
    return response.data;
  },

  updateTip: async (id: string, data: Partial<TipsPayload>) => {
    const response = await api.put(`/tips/${id}`, data);
    return response.data;
  },

  deleteTip: async (id: string) => {
    const response = await api.delete(`/tips/${id}`);
    return response.data;
  }
};
