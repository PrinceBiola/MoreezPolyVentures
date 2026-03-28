import api from './api';

export const transportService = {
  getCars: async (params = {}) => {
    try {
      return await api.get('/transport/cars', { params });
    } catch (error) {
      throw error;
    }
  },
  addCar: async (data) => {
    try {
      return await api.post('/transport/cars', data);
    } catch (error) {
      throw error;
    }
  },
  getPayments: async (params = {}) => {
    try {
      return await api.get('/transport/payments', { params });
    } catch (error) {
      throw error;
    }
  },
  addPayment: async (data) => {
    try {
      return await api.post('/transport/payments', data);
    } catch (error) {
      throw error;
    }
  },
  updatePayment: async (id, data) => {
    try {
      return await api.put(`/transport/payments/${id}`, data);
    } catch (error) {
      throw error;
    }
  },
  getExpenses: async (params = {}) => {
    try {
      return await api.get('/transport/expenses', { params });
    } catch (error) {
      throw error;
    }
  },
  addExpense: async (data) => {
    try {
      return await api.post('/transport/expenses', data);
    } catch (error) {
      throw error;
    }
  },
  updateExpense: async (id, data) => {
    try {
      return await api.put(`/transport/expenses/${id}`, data);
    } catch (error) {
      throw error;
    }
  },
  getCarDetails: async (id) => {
    try {
      return await api.get(`/transport/cars/${id}`);
    } catch (error) {
      throw error;
    }
  },
  updateCar: async (id, data) => {
    try {
      return await api.put(`/transport/cars/${id}`, data);
    } catch (error) {
      throw error;
    }
  },
  deleteCar: async (id) => {
    try {
      return await api.delete(`/transport/cars/${id}`);
    } catch (error) {
      throw error;
    }
  },
  deleteExpense: async (id) => {
    try {
      return await api.delete(`/transport/expenses/${id}`);
    } catch (error) {
      throw error;
    }
  },
  deletePayment: async (id) => {
    try {
      return await api.delete(`/transport/payments/${id}`);
    } catch (error) {
      throw error;
    }
  },
};

export default transportService;
