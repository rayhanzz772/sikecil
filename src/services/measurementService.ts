import api from './api';
import { Measurement } from '../types';

export const measurementService = {
  getByChildId: async (childId: string) => {
    const response = await api.get(`/children/${childId}/measurements`);
    return response.data;
  },

  create: async (childId: string, data: Partial<Measurement>) => {
    const response = await api.post(`/children/${childId}/measurements`, data);
    return response.data;
  },

  delete: async (childId: string, measurementId: string) => {
    const response = await api.delete(`/children/${childId}/measurements/${measurementId}`);
    return response.data;
  }
};
