import api from './api';
import { PredictionResponse } from '../types';

export interface PredictionRecord {
  id: string;
  child_id: string;
  model: string;
  horizon: string;
  results: PredictionResponse;
  created_at: string;
  updated_at: string;
}

export interface LatestPredictionResponse {
  prediction: PredictionRecord | null;
  is_stale: boolean;
}

export const predictionService = {
  generate: async (childId: string, horizon: number = 6) => {
    const response = await api.post(`/children/${childId}/predictions`, { horizon });
    return response.data;
  },

  getLatest: async (childId: string): Promise<{ data: LatestPredictionResponse }> => {
    const response = await api.get(`/children/${childId}/predictions/latest`);
    return response.data;
  },

  list: async (childId: string, page: number = 1, perPage: number = 10) => {
    const response = await api.get(`/children/${childId}/predictions`, {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  delete: async (childId: string, predictionId: string) => {
    const response = await api.delete(`/children/${childId}/predictions/${predictionId}`);
    return response.data;
  }
};
