import api from './api';

export const dashboardService = {
  getStats: async (params = {}) => {
    try {
      return await api.get('/dashboard/stats', { params });
    } catch (error) {
      throw error;
    }
  },
  globalSearch: async (q) => {
    try {
      return await api.get('/dashboard/search', { params: { q } });
    } catch (error) {
      throw error;
    }
  },
};

export default dashboardService;
