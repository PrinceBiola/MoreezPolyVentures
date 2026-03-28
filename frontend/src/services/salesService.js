import api from './api';

export const salesService = {
  getSales: async (params = {}) => {
    try {
      return await api.get('/business/sales', { params });
    } catch (error) {
      throw error;
    }
  },
  recordSale: async (data) => {
    try {
      return await api.post('/business/sales', data);
    } catch (error) {
      throw error;
    }
  },
  deleteSale: async (id) => {
    try {
      return await api.delete(`/business/sales/${id}`);
    } catch (error) {
      throw error;
    }
  },
};

export default salesService;
