import api from './api';

export const businessService = {
  getProducts: async (params = {}) => {
    try {
      return await api.get('/business', { params });
    } catch (error) {
      throw error;
    }
  },
  addProduct: async (data) => {
    try {
      return await api.post('/business', data);
    } catch (error) {
      throw error;
    }
  },
  updateStock: async (id, currentStock) => {
    try {
      return await api.patch(`/business/${id}`, { currentStock });
    } catch (error) {
      throw error;
    }
  },
  updateProduct: async (id, data) => {
    try {
      return await api.put(`/business/${id}`, data);
    } catch (error) {
      throw error;
    }
  },
  getPurchases: async (params = {}) => {
    try {
      return await api.get('/business/purchases', { params });
    } catch (error) {
      throw error;
    }
  },
  recordPurchase: async (data) => {
    try {
      return await api.post('/business/purchases', data);
    } catch (error) {
      throw error;
    }
  },
  deletePurchase: async (id) => {
    try {
      return await api.delete(`/business/purchases/${id}`);
    } catch (error) {
      throw error;
    }
  },
  // Aliases for Business.jsx compatibility
  getInventory: async (params = {}) => {
    try {
      return await api.get('/business', { params });
    } catch (error) {
      throw error;
    }
  },
  addInventoryItem: async (data) => {
    try {
      return await api.post('/business', data);
    } catch (error) {
      throw error;
    }
  },
  deleteInventoryItem: async (id) => {
    try {
      return await api.delete(`/business/${id}`);
    } catch (error) {
      throw error;
    }
  },
  repairStock: async () => {
    try {
      return await api.post('/business/repair-stock');
    } catch (error) {
      throw error;
    }
  },
  getExpenses: async (params = {}) => {
    try {
      return await api.get('/business/expenses', { params });
    } catch (error) {
      throw error;
    }
  },
  addExpense: async (data) => {
    try {
      return await api.post('/business/expenses', data);
    } catch (error) {
      throw error;
    }
  },
  updateExpense: async (id, data) => {
    try {
      return await api.put(`/business/expenses/${id}`, data);
    } catch (error) {
      throw error;
    }
  },
  deleteExpense: async (id) => {
    try {
      return await api.delete(`/business/expenses/${id}`);
    } catch (error) {
      throw error;
    }
  },
};

export default businessService;
