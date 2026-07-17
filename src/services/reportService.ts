import api from './api';

export interface ReportFilter {
  month?: number;
  year?: number;
  posyandu_id?: string;
  status?: string;
  desa_id?: string;
  q?: string;
}

export const reportService = {
  getMeasurements: async (params?: ReportFilter) => {
    const response = await api.get('/reports/measurements', { params });
    return response.data;
  },

  getNutritionSummary: async (params?: ReportFilter) => {
    const response = await api.get('/reports/nutrition-summary', { params });
    return response.data;
  },

  getAtRisk: async (params?: ReportFilter & { page?: number; per_page?: number }) => {
    const response = await api.get('/reports/at-risk', { params });
    return response.data;
  },

  getPosyanduActivity: async (params?: ReportFilter) => {
    const response = await api.get('/reports/posyandu-activity', { params });
    return response.data;
  },

  getChildGrowth: async (id: string) => {
    const response = await api.get(`/reports/child-growth/${id}`);
    return response.data;
  }
};
