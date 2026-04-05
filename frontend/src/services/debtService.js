import api from './api';

export const debtService = {
  getDebts: (params) => api.get('/debts', { params }),
  createDebt: (data) => api.post('/debts', data),
  settleDebt: (id) => api.patch(`/debts/${id}/settle`),
  recordPayment: (id, data) => api.post(`/debts/${id}/payments`, data),
  deleteDebt: (id) => api.delete(`/debts/${id}`)
};
