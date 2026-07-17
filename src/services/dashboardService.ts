import api from './api';

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getNutritionStatus: async () => {
    const response = await api.get('/dashboard/nutrition-status');
    return response.data;
  },

  getAlerts: async () => {
    const response = await api.get('/dashboard/alerts');
    return response.data;
  },

  getMeasurementTrend: async () => {
    const response = await api.get('/dashboard/measurement-trend');
    return response.data;
  },

  getGenderDistribution: async () => {
    const response = await api.get('/dashboard/gender-distribution');
    return response.data;
  },

  getPosyanduStats: async () => {
    const response = await api.get('/dashboard/posyandu-stats');
    return response.data;
  }
};
